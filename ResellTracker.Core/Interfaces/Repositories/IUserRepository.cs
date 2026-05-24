using ResellTracker.Core.Models;

namespace ResellTracker.Core.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email);
    Task<IEnumerable<User>> GetAllAsync();
    Task<Guid> InsertAsync(User user);
    Task UpdateRoleAsync(Guid id, string role);
    Task UpdateStatusAsync(Guid id, string status);
    Task UpdateLastLoginAsync(Guid id);
    Task DeleteAsync(Guid id);
}
