using ResellTracker.Core.Models;

namespace ResellTracker.Core.Interfaces.Repositories;

public interface ISupplierRepository
{
    Task<IEnumerable<Supplier>> GetAllAsync(bool? isActive);
    Task<Supplier?> GetByIdAsync(Guid id);
    Task<Guid> InsertAsync(Supplier supplier);
    Task UpdateAsync(Supplier supplier);
    Task DeleteAsync(Guid id);
}
