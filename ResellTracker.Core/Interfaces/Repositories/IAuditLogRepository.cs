using ResellTracker.Core.Models;

namespace ResellTracker.Core.Interfaces.Repositories;

public interface IAuditLogRepository
{
    Task LogAsync(AuditLog entry);
    Task<PagedResult<AuditLog>> GetAllAsync(int pageNumber, int pageSize);
    Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityName, string entityId);
    Task<IEnumerable<AuditLog>> GetByUserAsync(string userEmail);
    Task<IEnumerable<AuditLog>> GetByDateRangeAsync(DateTime from, DateTime to);
}
