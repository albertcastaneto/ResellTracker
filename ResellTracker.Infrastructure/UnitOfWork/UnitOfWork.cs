using ResellTracker.Core.Interfaces;
using ResellTracker.Core.Interfaces.Repositories;
using ResellTracker.Infrastructure.Data;
using ResellTracker.Infrastructure.Repositories;

namespace ResellTracker.Infrastructure.UnitOfWork;

public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    private IInventoryRepository? _inventory;
    private ISalesLogRepository?  _salesLog;
    private ISupplierRepository?  _suppliers;
    private IPlatformRepository?  _platforms;
    private ISkuRepository?       _sku;
    private IUserRepository?      _users;
    private IReportRepository?    _reports;
    private IAuditLogRepository?  _auditLog;

    public UnitOfWork(AppDbContext context) => _context = context;

    public IInventoryRepository Inventory  => _inventory  ??= new InventoryRepository(_context);
    public ISalesLogRepository  SalesLog   => _salesLog   ??= new SalesLogRepository(_context);
    public ISupplierRepository  Suppliers  => _suppliers  ??= new SupplierRepository(_context);
    public IPlatformRepository  Platforms  => _platforms  ??= new PlatformRepository(_context);
    public ISkuRepository       Sku        => _sku        ??= new SkuRepository(_context);
    public IUserRepository      Users      => _users      ??= new UserRepository(_context);
    public IReportRepository    Reports    => _reports    ??= new ReportRepository(_context);
    public IAuditLogRepository  AuditLog   => _auditLog   ??= new AuditLogRepository(_context);

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        => _context.SaveChangesAsync(cancellationToken);

    public void Dispose() => _context.Dispose();
}
