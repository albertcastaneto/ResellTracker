using ResellTracker.Core.Models;

namespace ResellTracker.Core.Interfaces.Repositories;

public interface IPlatformRepository
{
    Task<IEnumerable<Platform>> GetAllAsync();
    Task<Platform?> GetByIdAsync(Guid id);
    Task<Guid> InsertAsync(Platform platform);
    Task UpdateAsync(Platform platform);
    Task DeleteAsync(Guid id);
}
