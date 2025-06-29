using api.Data;
using api.Models;

namespace api.Repositories
{
    public interface IImageRepository
    {
        Task<Image> CreateAsync(Image image);
        Task<Image?> GetByIdAsync(Guid id);
        Task<PageResponse<Image>> GetAllAsync(int page, int pageSize); // Modified for pagination
        Task<PageResponse<Image>> GetByCategoryAsync(string category, int page, int pageSize); // Modified for pagination
        Task<Image?> UpdateAsync(Image image);
        Task<bool> DeleteAsync(Guid id);
    }
}
