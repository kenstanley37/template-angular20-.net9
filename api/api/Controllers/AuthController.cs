using api.Data;
using api.Models;
using api.Models.Dto;
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

        /// <summary>
        /// Initializes a new instance of the <see cref="AuthController"/> class.
        /// </summary>
        public AuthController(AuthDbContext context, IConfiguration configuration, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _configuration = configuration;
            _httpClient = httpClientFactory.CreateClient();
        }

        /// <summary>
        /// Registers a new user and sends a verification email.
        /// </summary>
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            // Check if email already exists
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
            {
                return BadRequest("Email already exists.");
            }

            // Create new user with hashed password and verification token
            var verificationToken = Guid.NewGuid().ToString();
            var user = new User
            {
                Name = dto.Name,
                Email = dto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                EmailVerificationToken = verificationToken
            };

            // Save user to database
            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Send email verification link
            await SendVerificationEmail(user.Email, verificationToken);

            return Ok("User registered successfully. Please check your email to verify your account.");
        }

        /// <summary>
        /// Authenticates a user and issues JWT and refresh tokens.
        /// </summary>
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            // Find user by email and verify password
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid credentials.");
            }

            // Ensure email is verified
            if (!user.IsEmailVerified)
            {
                return Unauthorized("Please verify your email before logging in.");
            }

            // Generate and set JWT token
            var token = GenerateJwtToken(user);
            SetAuthCookie(token);

            // Generate and set refresh token if requested
            if (dto.StayLoggedIn)
            {
                var refreshToken = await GenerateRefreshToken(user);
                SetRefreshCookie(refreshToken.Token);
            }

            return Ok();
        }

        /// <summary>
        /// Verifies a user's email using the provided token.
        /// </summary>
        [HttpGet("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            // Find user by verification token
            var user = await _context.Users.FirstOrDefaultAsync(u => u.EmailVerificationToken == token);
            if (user == null)
            {
                return BadRequest("Invalid verification token.");
            }

            // Mark email as verified
            user.IsEmailVerified = true;
            user.EmailVerificationToken = null;
            await _context.SaveChangesAsync();

            return Ok("Email verified successfully.");
        }

        /// <summary>
        /// Authenticates a user via Google and issues tokens.
        /// </summary>
        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] SocialLoginDto authToken)
        {
            try
            {
                // Validate Google token
                var settings = new GoogleJsonWebSignature.ValidationSettings
                {
                    Audience = new[] { _configuration["Google:ClientId"] }
                };
                var payload = await GoogleJsonWebSignature.ValidateAsync(authToken.Token, settings);

                // Check payload validity
                if (string.IsNullOrEmpty(payload.Email) || string.IsNullOrEmpty(payload.Subject))
                {
                    return BadRequest("Invalid Google token payload: missing email or sub.");
                }

                // Find or create user
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

                // Generate and set tokens
                var token = GenerateJwtToken(user);
                SetAuthCookie(token);

                if (authToken.StayLoggedIn)
                {
                    //var refreshToken = await GenerateRefreshToken(user);
                    //SetRefreshCookie(refreshToken.Token);
                }

                var refreshToken = await GenerateRefreshToken(user);
                SetRefreshCookie(refreshToken.Token);

                // Return user profile
                return Ok(new ProfileDto
                {
                    Name = payload.Name,
                    Email = payload.Email,
                    ProfilePicture = payload.Picture,
                    Id = user.Id
                });
            }
            catch (InvalidJwtException)
            {
                return Unauthorized("Invalid Google token.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
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
                // Validate Facebook token
                var payload = await ValidateFacebookToken(authToken.Token);
                if (payload == null)
                {
                    return BadRequest("Invalid Facebook token.");
                }

                // Check payload validity
                if (string.IsNullOrEmpty(payload.Email) || string.IsNullOrEmpty(payload.Id))
                {
                    return BadRequest("Invalid Facebook token payload: missing email or id.");
                }

                // Find or create user
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

                // Generate and set tokens
                var token = GenerateJwtToken(user);
                SetAuthCookie(token);

                if (authToken.StayLoggedIn)
                {
                    var refreshToken = await GenerateRefreshToken(user);
                    SetRefreshCookie(refreshToken.Token);
                }

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        /// <summary>
        /// Refreshes JWT token using a valid refresh token.
        /// </summary>
        [HttpPost("refresh")]
        public async Task<IActionResult> Refresh()
        {
            // Retrieve refresh token from cookie
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                return Unauthorized("No refresh token provided.");
            }

            // Validate refresh token
            var tokenEntity = await _context.RefreshTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == refreshToken && !t.IsRevoked && t.Expires > DateTime.UtcNow);

            if (tokenEntity == null)
            {
                Response.Cookies.Delete("refresh_token");
                return Unauthorized("Invalid or expired refresh token.");
            }

            // Generate and set new JWT token
            var newJwt = GenerateJwtToken(tokenEntity.User);
            SetAuthCookie(newJwt);

            return Ok();
        }

        /// <summary>
        /// Logs out a user by revoking refresh token and clearing cookies.
        /// </summary>
        [HttpPost("logout")]
        public async Task<IActionResult> Logout()
        {
            // Revoke refresh token if present
            var refreshToken = Request.Cookies["refresh_token"];
            if (!string.IsNullOrEmpty(refreshToken))
            {
                var tokenEntity = await _context.RefreshTokens.FirstOrDefaultAsync(t => t.Token == refreshToken);
                if (tokenEntity != null)
                {
                    tokenEntity.IsRevoked = true;
                    await _context.SaveChangesAsync();
                }
                Response.Cookies.Delete("refresh_token");
            }

            // Clear auth token cookie
            Response.Cookies.Delete("auth_token");
            return Ok();
        }

        /// <summary>
        /// Retrieves the authenticated user's profile.
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var token = Request.Cookies["auth_token"];
            var email = ValidateJwtToken(token);
            if (string.IsNullOrEmpty(email))
            {
                var refreshResult = await TryRefreshToken();
                if (refreshResult != null)
                {
                    return refreshResult;
                }
                Response.Cookies.Delete("auth_token");
                return Unauthorized(new { success = false, message = "User not authenticated." }); // Return JSON
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return NotFound(new { success = false, message = "User not found." }); // Return JSON
            }

            return Ok(new ProfileDto
            {
                Name = user.Name,
                Email = user.Email,
                ProfilePicture = user.ProfilePicture
            });
        }

        /// <summary>
        /// Updates the authenticated user's profile picture.
        /// </summary>
        [HttpPost("profile/picture")]
        public async Task<IActionResult> UpdateProfilePicture([FromBody] UpdateProfilePictureDto dto)
        {
            // Validate JWT token
            var token = Request.Cookies["auth_token"];
            var email = ValidateJwtToken(token);
            if (string.IsNullOrEmpty(email))
            {
                var refreshResult = await TryRefreshToken();
                if (refreshResult != null)
                {
                    return refreshResult;
                }
                Response.Cookies.Delete("auth_token");
                return Unauthorized("User not authenticated.");
            }

            // Find user by email
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Validate base64 image
            if (!string.IsNullOrEmpty(dto.ProfilePicture) && !IsValidBase64Image(dto.ProfilePicture))
            {
                return BadRequest("Invalid image format. Must be a valid Base64-encoded image (JPEG or PNG).");
            }

            // Update profile picture
            user.ProfilePicture = dto.ProfilePicture;
            await _context.SaveChangesAsync();

            return Ok("Profile picture updated successfully.");
        }

        /// <summary>
        /// Attempts to refresh JWT token if the current one is invalid.
        /// </summary>
        private async Task<IActionResult?> TryRefreshToken()
        {
            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                return null;
            }

            var tokenEntity = await _context.RefreshTokens
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Token == refreshToken && !t.IsRevoked && t.Expires > DateTime.UtcNow);

            if (tokenEntity == null)
            {
                Response.Cookies.Delete("refresh_token");
                return Unauthorized("Invalid or expired refresh token.");
            }

            var newJwt = GenerateJwtToken(tokenEntity.User);
            SetAuthCookie(newJwt);

            return null;
        }

        /// <summary>
        /// Sets the JWT token in an HTTP-only cookie.
        /// </summary>
        private void SetAuthCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTime.UtcNow.AddHours(1)
            };
            Response.Cookies.Append("auth_token", token, cookieOptions);
        }

        /// <summary>
        /// Sets the refresh token in an HTTP-only cookie.
        /// </summary>
        private void SetRefreshCookie(string token)
        {
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTime.UtcNow.AddDays(30)
            };
            Response.Cookies.Append("refresh_token", token, cookieOptions);
        }

        /// <summary>
        /// Generates a new refresh token for a user.
        /// </summary>
        private async Task<RefreshToken> GenerateRefreshToken(User user)
        {
            var refreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = Guid.NewGuid().ToString(),
                Expires = DateTime.UtcNow.AddDays(30),
                IsRevoked = false
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            return refreshToken;
        }

        /// <summary>
        /// Validates a JWT token and returns the email claim.
        /// </summary>
        private string? ValidateJwtToken(string token)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not found.");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer not found.");
            var jwtAudience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience not found.");

            var tokenHandler = new JwtSecurityTokenHandler();
            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                }, out var validatedToken);

                var jwtToken = validatedToken as JwtSecurityToken;
                return jwtToken?.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
            }
            catch
            {
                return null;
            }
        }

        /// <summary>
        /// Validates a base64-encoded image string.
        /// </summary>
        private bool IsValidBase64Image(string base64String)
        {
            if (string.IsNullOrEmpty(base64String))
            {
                return true; // Allow empty to clear picture
            }

            try
            {
                if (!base64String.StartsWith("data:image/"))
                {
                    return false;
                }

                var parts = base64String.Split(',');
                if (parts.Length != 2)
                {
                    return false;
                }

                var mimeType = parts[0].Split(';')[0].Replace("data:", "");
                if (mimeType != "image/jpeg" && mimeType != "image/png")
                {
                    return false;
                }

                Convert.FromBase64String(parts[1]);
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Generates a JWT token for a user.
        /// </summary>
        private string GenerateJwtToken(User user)
        {
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not found.");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer not found.");
            var jwtAudience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience not found.");

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, user.Name)
            };

            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Sends a verification email with a link to the user.
        /// </summary>
        private async Task SendVerificationEmail(string email, string token)
        {
            var smtpHost = _configuration["Smtp:Host"];
            var smtpPort = int.Parse(_configuration["Smtp:Port"]!);
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
        }
        //
        [HttpGet("check")]
        [Authorize]
        public IActionResult CheckAuth()
        {
            return Ok(new { isAuthenticated = true });
        }


        /// <summary>
        /// Validates a Facebook token and retrieves user information.
        /// </summary>
        private async Task<FacebookTokenPayload?> ValidateFacebookToken(string token)
        {
            var appId = _configuration["Facebook:AppId"] ?? throw new InvalidOperationException("Facebook:AppId not found.");
            var appSecret = _configuration["Facebook:AppSecret"] ?? throw new InvalidOperationException("Facebook:AppSecret not found.");

            // Validate token
            var response = await _httpClient.GetAsync($"https://graph.facebook.com/debug_token?input_token={token}&access_token={appId}|{appSecret}");
            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            var content = await response.Content.ReadAsStringAsync();
            var debugToken = JsonSerializer.Deserialize<FacebookDebugTokenResponse>(content, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (debugToken?.Data?.IsValid != true)
            {
                return null;
            }

            // Retrieve user information
            var userResponse = await _httpClient.GetAsync($"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={token}");
            if (!userResponse.IsSuccessStatusCode)
            {
                return null;
            }

            var userContent = await userResponse.Content.ReadAsStringAsync();
            return JsonSerializer.Deserialize<FacebookTokenPayload>(userContent, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
    }
}