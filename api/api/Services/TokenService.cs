using api.Controllers;
using api.Data;
using api.Models;
using Azure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using static api.Models.TokenPayloads;

namespace api.Services
{
    public class TokenService : iTokenService
    {
        private readonly AuthDbContext _context;
        private readonly IConfiguration _config;
        private readonly HttpClient _httpClient;
        private readonly ILogger<AuthController> _logger;       

        public TokenService(
            AuthDbContext context, 
            IConfiguration configuration, 
            HttpClient httpClient, 
            ILogger<AuthController> logger
            )
        {
            _context = context;
            _config = configuration;
            _httpClient = httpClient;
            _logger = logger;
            
        }

        /// <summary>
        /// Generates a JWT token for a user.
        /// </summary>
        public string GenerateJwtToken(User user)
        {
            try
            {
                var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not found.");
                var jwtIssuer = _config["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer not found.");
                var jwtAudience = _config["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience not found.");

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

                var jwt = new JwtSecurityTokenHandler().WriteToken(token);
                _logger.LogDebug("JWT generated for user: {Email}", user.Email);
                return jwt;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating JWT for user: {Email}", user.Email);
                throw;
            }
        }
        /// <summary>
        /// Generates a new refresh token for a user.
        /// </summary>
        public async Task<RefreshToken> GenerateRefreshToken(User user, string deviceId)
        {
            var refreshToken = new RefreshToken
            {
                UserId = user.Id,
                Token = Guid.NewGuid().ToString(),
                Expires = DateTime.UtcNow.AddDays(30),
                IsRevoked = false,
                DeviceId = deviceId,
                CreatedAt = DateTime.UtcNow
            };

            _context.RefreshTokens.Add(refreshToken);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Refresh token generated for user: {Email} on device: {DeviceId}", user.Email, deviceId);
            return refreshToken;
        }

        /// <summary>
        /// Validates a JWT token and returns the email claim.
        /// </summary>
        public string ValidateJwtToken(string token)
        {
            try
            {
                if (string.IsNullOrEmpty(token))
                {
                    _logger.LogWarning("JWT validation attempt with empty token");
                    return null!;
                }

                var jwtKey = _config["Jwt:Key"] ?? throw new InvalidOperationException("Jwt:Key not found.");
                var jwtIssuer = _config["Jwt:Issuer"] ?? throw new InvalidOperationException("Jwt:Issuer not found.");
                var jwtAudience = _config["Jwt:Audience"] ?? throw new InvalidOperationException("Jwt:Audience not found.");

                var tokenHandler = new JwtSecurityTokenHandler();
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
                var email = jwtToken?.Claims.FirstOrDefault(c => c.Type == JwtRegisteredClaimNames.Sub)?.Value;
                _logger.LogDebug("JWT validated successfully for email: {Email}", email);
                return email ?? string.Empty;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to validate JWT token");
                return string.Empty;
            }
        }

        /// <summary>
        /// Validates a Facebook token and retrieves user information.
        /// </summary>
       public async Task<FacebookTokenPayload?> ValidateFacebookToken(string token)
        {
            try
            {
                _logger.LogInformation("Validating Facebook token");

                var appId = _config["Facebook:AppId"] ?? throw new InvalidOperationException("Facebook:AppId not found.");
                var appSecret = _config["Facebook:AppSecret"] ?? throw new InvalidOperationException("Facebook:AppSecret not found.");

                var response = await _httpClient.GetAsync($"https://graph.facebook.com/debug_token?input_token={token}&access_token={appId}|{appSecret}");
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Facebook token validation failed with status: {StatusCode}", response.StatusCode);
                    return null;
                }

                var content = await response.Content.ReadAsStringAsync();
                var debugToken = JsonSerializer.Deserialize<FacebookDebugTokenResponse>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (debugToken?.Data?.IsValid != true)
                {
                    _logger.LogWarning("Facebook token is invalid");
                    return null;
                }

                var userResponse = await _httpClient.GetAsync($"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={token}");
                if (!userResponse.IsSuccessStatusCode)
                {
                    _logger.LogWarning("Failed to retrieve Facebook user info with status: {StatusCode}", userResponse.StatusCode);
                    return null;
                }

                var userContent = await userResponse.Content.ReadAsStringAsync();
                var payload = JsonSerializer.Deserialize<FacebookTokenPayload>(userContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                _logger.LogInformation("Facebook token validated successfully");
                return payload;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating Facebook token");
                return null;
            }
        }

        /// <summary>
        /// Sets the JWT token in an HTTP-only cookie.
        /// </summary>
        public CookieOptions GetAuthCookieOptions()
        {
            var secureSetting = _config["CookieOptions:Secure"];
            var isSecure = bool.TryParse(secureSetting, out var secureValue) && secureValue;

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = isSecure,
                SameSite = SameSiteMode.None,
                Path = "/",
                //Expires = DateTime.UtcNow.AddHours(1)
                Expires = DateTime.UtcNow.AddMinutes(5)
            };
            
            return cookieOptions;
        }

        /// <summary>
        /// Sets the refresh token in an HTTP-only cookie.
        /// </summary>
        public CookieOptions GetRefreshCookieOptions()
        {
            var secureSetting = _config["CookieOptions:Secure"];
            var isSecure = bool.TryParse(secureSetting, out var secureValue) && secureValue;

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = isSecure,
                SameSite = SameSiteMode.None,
                Path = "/",
                Expires = DateTime.UtcNow.AddDays(30)
            };

            return cookieOptions;
        }

        public async Task<RefreshToken?> ValidateRefreshTokenAsync(string token, int userId)
        {
            var refreshToken = await _context.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.Token == token && rt.UserId == userId);

            if (refreshToken == null || refreshToken.IsRevoked || refreshToken.Expires < DateTime.UtcNow)
            {
                _logger.LogWarning("Invalid or expired refresh token for user {UserId}", userId);
                return null;
            }

            return refreshToken;
        }

    }
}
