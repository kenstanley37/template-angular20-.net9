using api.Data;
using api.Models;
using api.Repositories;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageController : ControllerBase
    {
        private readonly IImageRepository _repository;
        private readonly AuthDbContext _context;

        public ImageController(IImageRepository repository, AuthDbContext context)
        {
            _repository = repository;
            _context = context;
        }

        [HttpPost]
        public async Task<IActionResult> Upload([FromForm] IFormFile file, [FromForm] string name, [FromForm] string category)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);

            var image = new Image
            {
                Name = name,
                Category = category,
                ContentType = file.ContentType,
                Data = memoryStream.ToArray()
            };

            var createdImage = await _repository.CreateAsync(image);
            return CreatedAtAction(nameof(GetById), new { id = createdImage.Id }, createdImage);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var image = await _repository.GetByIdAsync(id);
            if (image == null)
            {
                return NotFound();
            }

            return File(image.Data, image.ContentType);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1 || pageSize < 1)
            {
                return BadRequest("Page and pageSize must be greater than 0.");
            }

            var pagedImages = await _repository.GetAllAsync(page, pageSize);

            var response = new PageResponse<object>
            {
                Items = pagedImages.Items.Select(i => new
                {
                    i.Id,
                    i.Name,
                    i.Category,
                    i.ContentType,
                    i.CreatedAt,
                    i.UpdatedAt,
                    Base64 = $"data:{i.ContentType};base64,{Convert.ToBase64String(i.Data)}"
                }),
                Page = pagedImages.Page,
                PageSize = pagedImages.PageSize,
                TotalCount = pagedImages.TotalCount
            };

            return Ok(response);
        }

        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetByCategory(string category, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            if (page < 1 || pageSize < 1)
            {
                return BadRequest("Page and pageSize must be greater than 0.");
            }

            var pagedImages = await _repository.GetByCategoryAsync(category, page, pageSize);
            var response = new PageResponse<object>
            {
                Items = pagedImages.Items.Select(i => new { i.Id, i.Name, i.Category, i.ContentType, i.CreatedAt, i.UpdatedAt }),
                Page = pagedImages.Page,
                PageSize = pagedImages.PageSize,
                TotalCount = pagedImages.TotalCount
            };

            return Ok(response);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromForm] IFormFile file, [FromForm] string name, [FromForm] string category)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file uploaded.");
            }

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);

            var image = new Image
            {
                Id = id,
                Name = name,
                Category = category,
                ContentType = file.ContentType,
                Data = memoryStream.ToArray()
            };

            var updatedImage = await _repository.UpdateAsync(image);
            if (updatedImage == null)
            {
                return NotFound();
            }

            return Ok(updatedImage);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _repository.DeleteAsync(id);
            if (!deleted)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetAllCategory()
        {
            var categories = await _context.Images
                .Select(img => img.Category)
                .Distinct()
                .ToListAsync();

            return Ok(categories);
        }

    }
}
