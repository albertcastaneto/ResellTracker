using ResellTracker.Core.Interfaces.Repositories;

namespace ResellTracker.Core.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IInventoryRepository Inventory { get; }
    ISalesLogRepository SalesLog { get; }
    ISupplierRepository Suppliers { get; }
    IPlatformRepository Platforms { get; }
    ISkuRepository Sku { get; }
    IUserRepository Users { get; }
    IReportRepository Reports { get; }
    IAuditLogRepository AuditLog { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
