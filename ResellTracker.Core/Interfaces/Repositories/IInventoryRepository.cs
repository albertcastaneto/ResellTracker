using ResellTracker.Core.Models;

namespace ResellTracker.Core.Interfaces.Repositories;

public interface IInventoryRepository
{
    Task<IEnumerable<InventoryItem>> GetAllAsync(string? status, Guid? categoryId, Guid? supplierId, Guid? platformId, string? search);
    Task<InventoryItem?> GetByIdAsync(Guid id);
    Task<IEnumerable<InventoryItem>> GetActiveAsync();
    Task<Guid> InsertAsync(InventoryItem item);
    Task UpdateAsync(InventoryItem item);
    Task UpdateStatusAsync(Guid id, string status);
    Task DeleteAsync(Guid id);
}
