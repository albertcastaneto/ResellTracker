using System.Text.Json;
using Microsoft.Extensions.Logging;
using ResellTracker.Core.Interfaces.Repositories;
using ResellTracker.Core.Models;

namespace ResellTracker.Core.Services;

public class AuditLogService
{
    private readonly IAuditLogRepository _repository;
    private readonly ILogger<AuditLogService> _logger;

    public AuditLogService(IAuditLogRepository repository, ILogger<AuditLogService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task LogActionAsync(
        string userEmail,
        string? userId,
        string action,
        string entityName,
        string entityId,
        object? oldValues = null,
        object? newValues = null,
        string? ipAddress = null)
    {
        try
        {
            var entry = new AuditLog
            {
                Id         = Guid.NewGuid(),
                UserId     = userId is not null ? Guid.Parse(userId) : null,
                UserEmail  = userEmail,
                Action     = action,
                EntityName = entityName,
                EntityId   = entityId,
                OldValues  = oldValues is null ? null : JsonSerializer.Serialize(oldValues),
                NewValues  = newValues is null ? null : JsonSerializer.Serialize(newValues),
                IpAddress  = ipAddress,
                CreatedAt  = DateTime.UtcNow
            };

            await _repository.LogAsync(entry);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Audit log failed for {Action} on {Entity}/{Id}", action, entityName, entityId);
        }
    }
}
