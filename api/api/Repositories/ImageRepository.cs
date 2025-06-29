using api.Data;
using api.Models;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;

namespace api.Repositories
{
    public class ImageRepository : IImageRepository
    {
        private readonly AuthDbContext _context;

        public ImageRepository(AuthDbContext context)
        {
            _context = context;
        }

        public async Task<Image> CreateAsync(Image image)
        {
            image.Id = Guid.NewGuid();
            image.CreatedAt = DateTime.UtcNow;
            _context.Images.Add(image);
            await _context.SaveChangesAsync();
            return image;
        }

        public async Task<Image?> GetByIdAsync(Guid id)
        {
            return await _context.Images.FindAsync(id);
        }

        public async Task<PageResponse<Image>> GetAllAsync(int page, int pageSize)
        {
            var totalCount = await _context.Images.CountAsync();
            var images = await _context.Images
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PageResponse<Image>
            {
                Items = images,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<PageResponse<Image>> GetByCategoryAsync(string category, int page, int pageSize)
        {
            var totalCount = await _context.Images
                .Where(i => i.Category == category)
                .CountAsync();

            var images = await _context.Images
                .Where(i => i.Category == category)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return new PageResponse<Image>
            {
                Items = images,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount
            };
        }

        public async Task<Image?> UpdateAsync(Image image)
        {
            var existingImage = await _context.Images.FindAsync(image.Id);
            if (existingImage == null)
            {
                return null;
            }

            existingImage.Name = image.Name;
            existingImage.Category = image.Category;
            existingImage.ContentType = image.ContentType;
            existingImage.Data = image.Data;
            existingImage.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return existingImage;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var image = await _context.Images.FindAsync(id);
            if (image == null)
            {
                return false;
            }

            _context.Images.Remove(image);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
