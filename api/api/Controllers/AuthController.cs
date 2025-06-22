using api.Data;
using api.Models;
using api.Models.Dto;
using api.Services;
using Google.Apis.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Net.Mail;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using static api.Models.TokenPayloads;

namespace api.Controllers
{
    /// <summary>
    /// Handles authentication-related operations such as registration, login, and social media authentication.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly ILogger<AuthController> _logger;
        private readonly iTokenService _tokenService;

        /// <summary>
        /// Initializes a new instance of the <see cref="AuthController"/> class.
        /// </summary>
        public AuthController(
            AuthDbContext context,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory,
            ILogger<AuthController> logger,
            iTokenService tokenService)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            _httpClient = httpClientFactory.CreateClient() ?? throw new ArgumentNullException(nameof(httpClientFactory));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
        }

        /// <summary>
        /// Registers a new user and sends a verification email.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                _logger.LogInformation("Register attempt for email: {Email}", dto?.Email);

                if (dto == null)
                {
                    _logger.LogWarning("Register attempt with null DTO");
                    return BadRequest(ApiResponse<string>.Error("Invalid registration data", 400));
                }

                if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                {
                    _logger.LogWarning("Attempt to register with existing email: {Email}", dto.Email);
                    return BadRequest(ApiResponse<string>.Error("Email already exists", 400));
                }

                var verificationToken = Guid.NewGuid().ToString();
                var user = new User
                {
                    Name = dto.Name,
                    Email = dto.Email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                    EmailVerificationToken = verificationToken
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                await SendVerificationEmail(user.Email, verificationToken);
                _logger.LogInformation("User registered successfully: {Email}", user.Email);

                return Ok(ApiResponse<string>.Ok("User registered successfully. Please check your email to verify your account."));
            }
            catch (SmtpException ex)
            {
                _logger.LogError(ex, "Failed to send verification email for {Email}", dto?.Email);
                return StatusCode(500, ApiResponse<string>.Error("Failed to send verification email", 500));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during registration for {Email}", dto?.Email);
                return StatusCode(500, ApiResponse<string>.Error("Database error occurred during registration", 500));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during registration for {Email}", dto?.Email);
                return StatusCode(500, ApiResponse<string>.Error("An unexpected error occurred during registration", 500));
            }
        }

        /// <summary>
        /// Authenticates a user and issues JWT and refresh tokens.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            try
            {
                _logger.LogInformation("Login attempt for email: {Email}", dto?.Email);

                if (dto == null)
                {
                    _logger.LogWarning("Login attempt with null DTO");
                    return BadRequest(ApiResponse<string>.Error("Invalid login data", 400));
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var userAgent = Request.Headers["User-Agent"].ToString();

                // Log attempt regardless of success
                async Task LogAttempt(int? userId, bool success)
                {
                    if (userId == null) return;

                    var attempt = new LoginAttempt
                    {
                        UserId = userId.Value,
                        Success = success,
                        IpAddress = ipAddress,
                        UserAgent = userAgent,
                        AttemptedAt = DateTime.UtcNow
                    };
                    _context.LoginAttempts.Add(attempt);
                    await _context.SaveChangesAsync();
                }

                // If user not found or password invalid
                if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                {
                    if (user != null)
                    {
                        user.FailedLoginAttempts++;
                        user.LastFailedLoginAt = DateTime.UtcNow;

                        if (user.FailedLoginAttempts >= 5)
                        {
                            user.LockoutEnd = DateTime.UtcNow.AddMinutes(15);
                        }

                        await _context.SaveChangesAsync();
                        await LogAttempt(user.Id, false);
                    }
                    else
                    {
                        // user == null: log attempt without userId
                        await LogAttempt(null, false);
                    }

                    _logger.LogWarning("Invalid login attempt for {Email}", dto.Email);
                    return Unauthorized(ApiResponse<string>.Error("Invalid credentials", 401));
                }

                // Check for lockout
                if (user.LockoutEnd.HasValue && user.LockoutEnd > DateTime.UtcNow)
                {
                    _logger.LogWarning("Locked out login attempt for {Email}", dto.Email);
                    await LogAttempt(user.Id, false);
                    return Unauthorized(ApiResponse<string>.Error("Account is locked. Try again later.", 401));
                }

                // Check email verification
                if (!user.IsEmailVerified)
                {
                    _logger.LogWarning("Login attempt with unverified email: {Email}", dto.Email);
                    await LogAttempt(user.Id, false);
                    return Unauthorized(ApiResponse<string>.Error("Please verify your email before logging in", 401));
                }

                // Successful login: reset failed attempts
                user.FailedLoginAttempts = 0;
                user.LockoutEnd = null;
                user.LastLoginIp = ipAddress;
                user.LastLoginUserAgent = userAgent;
                user.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await LogAttempt(user.Id, true);

                var token = _tokenService.GenerateJwtToken(user);
                var cookieOptions = _tokenService.GetAuthCookieOptions();
                Response.Cookies.Append("auth_token", token, cookieOptions);

                if (dto.StayLoggedIn)
                {
                    var refreshToken = await _tokenService.GenerateRefreshToken(user, dto.DeviceId);
                    var cookieRefresh = _tokenService.GetRefreshCookieOptions();
                    Response.Cookies.Append("refresh_token", refreshToken.Token, cookieRefresh);
                }

                _logger.LogInformation("User logged in successfully: {Email}", user.Email);
                return Ok(ApiResponse<object>.Ok(null, "Login successful"));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during login for {Email}", dto?.Email);
                return StatusCode(500, ApiResponse<string>.Error("Database error occurred during login", 500));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during login for {Email}", dto?.Email);
                return StatusCode(500, ApiResponse<string>.Error("An unexpected error occurred during login", 500));
            }
        }

        private async Task LogAttempt(int? userId, bool success, string? ipAddress, string? userAgent)
        {
            if (userId == null) return;

            var attempt = new LoginAttempt
            {
                UserId = userId.Value,
                Success = success,
                IpAddress = ipAddress,
                UserAgent = userAgent,
                AttemptedAt = DateTime.UtcNow
            };

            _context.LoginAttempts.Add(attempt);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Verifies a user's email using the provided token.
        /// </summary>
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            try
            {
                _logger.LogInformation("Email verification attempt with token: {Token}", token);

                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("Email verification attempt with empty token");
                    return BadRequest(ApiResponse<string>.Error("Verification token is required", 400));
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == token);
                if (user == null)
                {
                    _logger.LogWarning("Invalid email verification token: {Token}", token);
                    return BadRequest(ApiResponse<string>.Error("Invalid verification token", 400));
                }

                user.IsEmailVerified = true;
                user.EmailVerificationToken = null;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Email verified successfully for user: {Email}", user.Email);
                return Ok(ApiResponse<string>.Ok("Email verified successfully"));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during email verification with token: {Token}", token);
                return StatusCode(500, ApiResponse<string>.Error("Database error occurred during email verification", 500));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during email verification with token: {Token}", token);
                return StatusCode(500, ApiResponse<string>.Error("An unexpected error occurred during email verification", 500));
            }
        }

        /// <summary>
        /// Authenticates a user via Google and issues tokens.
        /// </summary>
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] SocialLoginDto authToken)
        {
            try
            {
                _logger.LogInformation("Google login attempt");

                if (authToken == null || string.IsNullOrEmpty(authToken.Token))
                {
                    _logger.LogWarning("Google login attempt with invalid DTO or token");
                    return BadRequest(ApiResponse<string>.Error("Invalid Google token", 400));
                }

                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _configuration["Google:ClientId"] }
                };
                var payload = await GoogleJsonWebSignature.ValidateAsync(authToken.Token, settings);

                if (string.IsNullOrEmpty(payload.Email) || string.IsNullOrEmpty(payload.Subject))
                {
                    _logger.LogWarning("Google login failed: missing email or subject in token");
                    return BadRequest(ApiResponse<string>.Error("Invalid Google token payload", 400));
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == payload.Subject || u.Email == payload.Email);
                if (user == null)
                {
                    user = new User
                    {
                        Name = payload.Name,
                        Email = payload.Email,
                        GoogleId = payload.Subject,
                        ProfilePicture = payload.Picture,
                        IsEmailVerified = true
                    };
                    _context.Users.Add(user);
                }
                else if (string.IsNullOrEmpty(user.GoogleId))
                {
                    user.GoogleId = payload.Subject;
                    user.ProfilePicture = payload.Picture;
                    user.IsEmailVerified = true;
                }

                await _context.SaveChangesAsync();

                var token = _tokenService.GenerateJwtToken(user);
                var cookieOptions = _tokenService.GetAuthCookieOptions();
                Response.Cookies.Append("auth_token", token, cookieOptions);

                var refreshToken = await _tokenService.GenerateRefreshToken(user, authToken.DeviceId);
                var refreshCookieOptions = _tokenService.GetRefreshCookieOptions();
                Response.Cookies.Append("refresh_token", refreshToken.Token, refreshCookieOptions);

                _logger.LogInformation("Google login success for user: {Email}", payload.Email);
                return Ok(ApiResponse<ProfileDto>.Ok(new ProfileDto
                {
                    Name = payload.Name,
                    Email = payload.Email,
                    ProfilePicture = payload.Picture,
                    Id = user.Id
                }, "Google login successful"));
            }
            catch (InvalidJwtException ex)
            {
                _logger.LogWarning(ex, "Invalid Google token during login");
                return Unauthorized(ApiResponse<string>.Error("Invalid Google token", 401));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during Google login");
                return StatusCode(500, ApiResponse<string>.Error("Database error occurred during Google login", 500));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during Google login");
                return StatusCode(500, ApiResponse<string>.Error($"An unexpected error occurred: {ex.Message}", 500));
            }
        }

        /// <summary>
        /// Authenticates a user via Facebook and issues tokens.
        /// </summary>
        [HttpPost("facebook-login")]
        public async Task<IActionResult> FacebookLogin([FromBody] SocialLoginDto authToken)
        {
            try
            {
                _logger.LogInformation("Facebook login attempt");

                if (authToken == null || string.IsNullOrEmpty(authToken.Token))
                {
                    _logger.LogWarning("Facebook login attempt with invalid DTO or token");
                    return BadRequest(ApiResponse<string>.Error("Invalid Facebook token", 400));
                }

                var payload = await _tokenService.ValidateFacebookToken(authToken.Token);
                if (payload == null)
                {
                    _logger.LogWarning("Invalid Facebook token");
                    return BadRequest(ApiResponse<string>.Error("Invalid Facebook token", 400));
                }

                if (string.IsNullOrEmpty(payload.Email) || string.IsNullOrEmpty(payload.Id))
                {
                    _logger.LogWarning("Invalid Facebook token payload");
                    return BadRequest(ApiResponse<string>.Error("Invalid Facebook token payload", 400));
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.FacebookId == payload.Id || u.Email == payload.Email);
                if (user == null)
                {
                    user = new User
                    {
                        Name = payload.Name!,
                        Email = payload.Email,
                        FacebookId = payload.Id,
                        ProfilePicture = payload.Picture?.Data?.Url,
                        IsEmailVerified = true
                    };
                    _context.Users.Add(user);
                }
                else if (string.IsNullOrEmpty(user.FacebookId))
                {
                    user.FacebookId = payload.Id;
                    user.ProfilePicture = payload.Picture?.Data?.Url;
                    user.IsEmailVerified = true;
                }

                await _context.SaveChangesAsync();

                var token = _tokenService.GenerateJwtToken(user);
                var cookieOptions = _tokenService.GetAuthCookieOptions();

                if (authToken.StayLoggedIn)
                {
                    var refreshToken = await _tokenService.GenerateRefreshToken(user, authToken.DeviceId);
                    var refreshCookieOptions = _tokenService.GetRefreshCookieOptions();
                    Response.Cookies.Append("refresh_token", refreshToken.Token, refreshCookieOptions);
                }

                _logger.LogInformation("Facebook login success for user: {Email}", user.Email);
                return Ok(ApiResponse<object>.Ok(null, "Facebook login successful"));
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to validate Facebook token");
                return StatusCode(500, ApiResponse<string>.Error("Failed to validate Facebook token", 500));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during Facebook login");
                return StatusCode(500, ApiResponse<string>.Error("Database error occurred during Facebook login", 500));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during Facebook login");
                return StatusCode(500, ApiResponse<string>.Error("An unexpected error occurred during Facebook login", 500));
            }
        }

        /// <summary>
        /// Refreshes JWT token using a valid refresh token.
        /// </summary>
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            try
            {
                _logger.LogInformation("Token refresh attempt");

                var deviceId = Request.Headers["X-Device-Id"].ToString();
                if (string.IsNullOrEmpty(deviceId))
                {
                    return BadRequest(ApiResponse<string>.Error("Device ID is required", 400));
                }

                var refreshToken = Request.Cookies["refresh_token"];
                if (string.IsNullOrEmpty(refreshToken))
                {
                    _logger.LogWarning("Token refresh attempt with no refresh token");
                    return Unauthorized(ApiResponse<string>.Error("No refresh token provided", 401));
                }

                var tokenEntity = await _context.RefreshTokens
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Token == refreshToken && !t.IsRevoked && t.Expires > DateTime.UtcNow && t.DeviceId == deviceId);

                if (tokenEntity == null)
                {
                    _logger.LogWarning("Invalid or expired refresh token: {Token}", refreshToken);
                    Response.Cookies.Delete("refresh_token");
                    return Unauthorized(ApiResponse<string>.Error("Invalid or expired refresh token", 401));
                }

                // Revoke the old refresh token
                tokenEntity.IsRevoked = true;

                // Generate new refresh token
                var newRefreshToken = await _tokenService.GenerateRefreshToken(tokenEntity.User, deviceId);

                // Generate new JWT token
                var newJwt = _tokenService.GenerateJwtToken(tokenEntity.User);

                // Save changes (revoked old token, added new token)
                await _context.SaveChangesAsync();

                // Set cookies with new tokens
                var cookieOptions = _tokenService.GetAuthCookieOptions();
                Response.Cookies.Append("auth_token", newJwt, cookieOptions);

                var refreshCookieOptions = _tokenService.GetRefreshCookieOptions();
                Response.Cookies.Append("refresh_token", newRefreshToken.Token, refreshCookieOptions);

                _logger.LogInformation("Token refreshed successfully for user: {Email}", tokenEntity.User.Email);
                return Ok(ApiResponse<object>.Ok(null, "Token refreshed successfully"));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during token refresh");
                return StatusCode(500, ApiResponse<string>.Error("Database error occurred during token refresh", 500));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during token refresh");
                return StatusCode(500, ApiResponse<string>.Error("An unexpected error occurred during token refresh", 500));
            }
        }


        /// <summary>
        /// Logs out a user by revoking refresh token and clearing cookies.
        /// </summary>
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            try
            {
                _logger.LogInformation("Logout attempt");

                var refreshToken = Request.Cookies["refresh_token"];
                if (!string.IsNullOrEmpty(refreshToken))
                {
                    var tokenEntity = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken);
                    if (tokenEntity != null)
                    {
                        tokenEntity.IsRevoked = true;
                        await _context.SaveChangesAsync();
                        _logger.LogInformation("Refresh token revoked: {Token}", refreshToken);
                    }
                }


                var refreshCookieOptions = _tokenService.GetRefreshCookieOptions();
                var authCookieOptions = _tokenService.GetAuthCookieOptions();
                // Cookie options that match how they were originally set

                Response.Cookies.Delete("refresh_token", refreshCookieOptions);
                Response.Cookies.Delete("auth_token", authCookieOptions);

                _logger.LogInformation("User logged out successfully");
                return Ok(ApiResponse<object>.Ok(null, "Logout successful"));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during logout");
                return StatusCode(500, ApiResponse<string>.Error("Database error occurred during logout", 500));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during logout");
                return StatusCode(500, ApiResponse<string>.Error("An unexpected error occurred during logout", 500));
            }
        }



        /// <summary>
        /// Updates the authenticated user's profile picture.
        /// </summary>
        [HttpPost("profile/picture")]
        public async Task<IActionResult> UpdateProfilePicture([FromBody] UpdateProfilePictureDto dto)  
        {
            try
            {
                _logger.LogInformation("Profile picture update attempt");

                if (dto == null)
                {
                    _logger.LogWarning("Profile picture update attempt with null DTO");
                    return BadRequest(ApiResponse<string>.Error("Invalid profile picture data", 400));
                }

                var token = Request.Cookies["auth_token"];
                var email = _tokenService.ValidateJwtToken(token!);
                if (string.IsNullOrEmpty(email))
                {
                    _logger.LogWarning("Profile picture update attempt with invalid token");
                    var refreshResult = await TryRefreshToken();
                    if (refreshResult != null)
                    {
                        return refreshResult;
                    }
                    Response.Cookies.Delete("auth_token");
                    return Unauthorized(ApiResponse<string>.Error("User not authenticated", 401));
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    _logger.LogWarning("User not found for email: {Email}", email);
                    return NotFound(ApiResponse<string>.Error("User not found", 404));
                }

                if (!string.IsNullOrEmpty(dto.ProfilePicture) && !IsValidBase64Image(dto.ProfilePicture))
                {
                    _logger.LogWarning("Invalid base64 image format for user: {Email}", email);
                    return BadRequest(ApiResponse<string>.Error("Invalid image format. Must be a valid Base64-encoded image (JPEG or PNG)", 400));
                }

                user.ProfilePicture = dto.ProfilePicture;
                await _context.SaveChangesAsync();

                _logger.LogInformation("Profile picture updated successfully for user: {Email}", email);
                return Ok(ApiResponse<string>.Ok("Profile picture updated successfully"));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during profile picture update");
                return StatusCode(500, ApiResponse<string>.Error("Database error occurred during profile picture update", 500));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during profile picture update");
                return StatusCode(500, ApiResponse<string>.Error("An unexpected error occurred during profile picture update", 500));
            }
        }

        /// <summary>
        /// Attempts to refresh JWT token if the current one is invalid.
        /// </summary>
        private async Task<IActionResult?> TryRefreshToken()
        {
            try
            {
                _logger.LogInformation("Attempting to refresh token");

                var refreshToken = Request.Cookies["refresh_token"];
                if (string.IsNullOrEmpty(refreshToken))
                {
                    _logger.LogWarning("No refresh token provided for token refresh");
                    return null;
                }

                var tokenEntity = await _context.RefreshTokens
                    .Include(t => t.User)
                    .FirstOrDefaultAsync(t => t.Token == refreshToken && !t.IsRevoked && t.Expires > DateTime.UtcNow);

                if (tokenEntity == null)
                {
                    _logger.LogWarning("Invalid or expired refresh token: {Token}", refreshToken);
                    Response.Cookies.Delete("refresh_token");
                    return Unauthorized(ApiResponse<string>.Error("Invalid or expired refresh token", 401));
                }

                var newJwt = _tokenService.GenerateJwtToken(tokenEntity.User);
                var cookieOptions = _tokenService.GetAuthCookieOptions();

                Response.Cookies.Append("auth_token", newJwt, cookieOptions);

                _logger.LogInformation("Token refreshed successfully for user: {Email}", tokenEntity.User.Email);
                return null;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during token refresh attempt");
                return StatusCode(500, ApiResponse<string>.Error("An unexpected error occurred during token refresh", 500));
            }
        }

       

        
        /// <summary>
        /// Validates a base64-encoded image string.
        /// </summary>
        private bool IsValidBase64Image(string base64String)
        {
            try
            {
                if (string.IsNullOrEmpty(base64String))
                {
                    _logger.LogDebug("Empty base64 image string, considered valid for clearing");
                    return true;
                }

                if (!base64String.StartsWith("data:image/"))
                {
                    _logger.LogWarning("Invalid base64 image format: missing data:image prefix");
                    return false;
                }

                var parts = base64String.Split(',');
                if (parts.Length != 2)
                {
                    _logger.LogWarning("Invalid base64 image format: incorrect parts count");
                    return false;
                }

                var mimeType = parts[0].Split(';')[0].Replace("data:", "");
                if (mimeType != "image/jpeg" && mimeType != "image/png")
                {
                    _logger.LogWarning("Invalid base64 image mime type: {MimeType}", mimeType);
                    return false;
                }

                Convert.FromBase64String(parts[1]);
                _logger.LogDebug("Base64 image validated successfully");
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to validate base64 image");
                return false;
            }
        }

        

        /// <summary>
        /// Sends a verification email with a link to the user.
        /// </summary>
        private async Task SendVerificationEmail(string email, string token)
        {
            try
            {
                _logger.LogInformation("Sending verification email to: {Email}", email);

                var smtpHost = _configuration["Smtp:Host"] ?? throw new InvalidOperationException("Smtp:Host not found.");
                var smtpPort = int.Parse(_configuration["Smtp:Port"] ?? throw new InvalidOperationException("Smtp:Port not found."));
                var smtpUsername = _configuration["Smtp:Username"] ?? throw new InvalidOperationException("Invalid Smtp email address.");
                var smtpPassword = _configuration["Smtp:Password"] ?? throw new InvalidOperationException("Invalid Smtp password.");
                var frontendUrl = _configuration["Frontend:Url"] ?? throw new InvalidOperationException("Frontend:Url not found.");

                var verificationLink = $"{frontendUrl}/verify-email?token={token}";
                var message = new MailMessage
                {
                    From = new MailAddress(smtpUsername),
                    Subject = "Verify Your Email",
                    Body = $"<p>Please verify your email by clicking the link below:</p><a href=\"{verificationLink}\">Verify Email</a>",
                    IsBodyHtml = true
                };
                message.To.Add(email);

                using var smtp = new SmtpClient(smtpHost, smtpPort)
                {
                    Credentials = new NetworkCredential(smtpUsername, smtpPassword),
                    EnableSsl = true
                };

                await smtp.SendMailAsync(message);
                _logger.LogInformation("Verification email sent successfully to: {Email}", email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to: {Email}", email);
                throw;
            }
        }

        /// <summary>
        /// Checks if the user is authenticated.
        /// </summary>
        [HttpGet("check")]
        [Authorize]
        public IActionResult CheckAuth()
        {
            _logger.LogInformation("Authentication check successful for user: {Email}", User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value);
            return Ok(ApiResponse<object>.Ok(new { isAuthenticated = true }, "Authentication check successful"));
        }

        
    }
}