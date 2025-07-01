using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DashboardController : ControllerBase
    {
        [HttpGet("sales")]
        public IActionResult GetSalesData()
        {
            var sales = new[]
            {
            new { Name = "Q1", Value = 15000 },
            new { Name = "Q2", Value = 20000 },
            new { Name = "Q3", Value = 18000 },
            new { Name = "Q4", Value = 22000 }
        };

            return Ok(sales);
        }

        [HttpGet("revenue")]
        public IActionResult GetRevenueData()
        {
            var revenue = new[]
            {
            new { Date = "2025-01-01", Revenue = 1000 },
            new { Date = "2025-02-01", Revenue = 1200 },
            new { Date = "2025-03-01", Revenue = 900 }
        };

            return Ok(revenue);
        }
    }
}
