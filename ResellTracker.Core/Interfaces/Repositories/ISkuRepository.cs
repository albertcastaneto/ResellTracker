using ResellTracker.Core.Models;

namespace ResellTracker.Core.Interfaces.Repositories;

public interface ISkuRepository
{
    Task<int> GetNextSequenceAsync(string brandCode, string categoryCode, string supplierCode);
    Task<Guid> InsertAsync(SkuRegistry sku);
    Task<IEnumerable<SkuRegistry>> GetRecentAsync();
}
