using ResellTracker.Core.Models;

namespace ResellTracker.Core.Interfaces.Repositories;

public interface ISalesLogRepository
{
    Task<IEnumerable<SaleLog>> GetAllAsync(Guid? platformId, Guid? categoryId, DateTime? fromDate, DateTime? toDate);
    Task<SaleLog?> GetByIdAsync(Guid id);
    Task<Guid> InsertAsync(SaleLog sale);
    Task UpdateAsync(SaleLog sale);
    Task DeleteAsync(Guid id);
}
