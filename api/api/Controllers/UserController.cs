using api.Data;
using api.Models.Dto;
using api.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly AuthDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;
        private readonly ILogger<AuthController> _logger;
        private readonly iTokenService _tokenService;

        public UserController(
            AuthDbContext context, 
            IConfiguration configuration, 
            HttpClient httpClient, 
            ILogger<AuthController> logger,
            iTokenService tokenService
            
            )
        {
            _context = context;
            _configuration = configuration;
            _httpClient = httpClient;
            _logger = logger;
            _tokenService = tokenService;
        }

        /// <summary>
        /// Retrieves the authenticated user's profile.
        /// </summary>
        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            try
            {
                _logger.LogInformation("Profile retrieval attempt");

                var token = Request.Cookies["auth_token"];
                var refreshToken = Request.Cookies["refresh_token"];
                var email = _tokenService.ValidateJwtToken(token!);
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
                if (user == null)
                {
                    _logger.LogWarning("User not found for email: {Email}", email);
                    return NotFound(ApiResponse<string>.Error("User not found", 404));
                }

                _logger.LogInformation("Profile retrieved successfully for user: {Email}", email);
                return Ok(ApiResponse<ProfileDto>.Ok(new ProfileDto
                {  
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    ProfilePicture = user.ProfilePicture
                }));
            }
            catch (DbUpdateException ex)
            {
                _logger.LogError(ex, "Database error during profile retrieval");
                return StatusCode(500, ApiResponse<string>.Error("Database error occurred during profile retrieval", 500));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error during profile retrieval");
                return StatusCode(500, ApiResponse<string>.Error("An unexpected error occurred during profile retrieval", 500));
            }
        }
    }
}
