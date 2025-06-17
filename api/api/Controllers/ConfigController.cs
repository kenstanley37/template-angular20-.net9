using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    /// <summary>
    /// Provides configuration data for client-side authentication.
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    public class ConfigController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        /// <summary>
        /// Initializes a new instance of the <see cref="ConfigController"/> class.
        /// </summary>
        public ConfigController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        /// <summary>
        /// Retrieves Google and Facebook client IDs for client-side authentication.
        /// </summary>
        [HttpGet]
        public IActionResult Get()
        {
            var config = new
            {
                GoogleClientId = _configuration["Google:ClientId"],
                FacebookAppId = _configuration["Facebook:AppId"]
            };
            return Ok(config);
        }
    }
}