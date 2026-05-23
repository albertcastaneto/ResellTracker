using System.Data;
using Microsoft.Data.SqlClient;
using ResellTracker.Core.Interfaces.Repositories;
using ResellTracker.Core.Models;
using ResellTracker.Infrastructure.Data;

namespace ResellTracker.Infrastructure.Repositories;

public class AuditLogRepository : RepositoryBase, IAuditLogRepository
{
    public AuditLogRepository(AppDbContext context) : base(context) { }

    public async Task LogAsync(AuditLog entry)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_AuditLog_Insert", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id",         entry.Id);
        cmd.Parameters.AddWithValue("@UserId",     (object?)entry.UserId   ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@UserEmail",  entry.UserEmail);
        cmd.Parameters.AddWithValue("@Action",     entry.Action);
        cmd.Parameters.AddWithValue("@EntityName", entry.EntityName);
        cmd.Parameters.AddWithValue("@EntityId",   entry.EntityId);
        cmd.Parameters.AddWithValue("@OldValues",  (object?)entry.OldValues  ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@NewValues",  (object?)entry.NewValues  ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@IpAddress",  (object?)entry.IpAddress  ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@CreatedAt",  entry.CreatedAt);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task<PagedResult<AuditLog>> GetAllAsync(int pageNumber, int pageSize)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_AuditLog_GetAll", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@PageNumber", pageNumber);
        cmd.Parameters.AddWithValue("@PageSize",   pageSize);
        await using var reader = await cmd.ExecuteReaderAsync();
        var items = new List<AuditLog>();
        while (await reader.ReadAsync()) items.Add(MapAuditLog(reader));
        int totalCount = 0;
        if (await reader.NextResultAsync() && await reader.ReadAsync())
            totalCount = reader.GetInt32(0);
        return new PagedResult<AuditLog> { Items = items, TotalCount = totalCount, PageNumber = pageNumber, PageSize = pageSize };
    }

    public async Task<IEnumerable<AuditLog>> GetByEntityAsync(string entityName, string entityId)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_AuditLog_GetByEntity", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@EntityName", entityName);
        cmd.Parameters.AddWithValue("@EntityId",   entityId);
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<AuditLog>();
        while (await reader.ReadAsync()) results.Add(MapAuditLog(reader));
        return results;
    }

    public async Task<IEnumerable<AuditLog>> GetByUserAsync(string userEmail)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_AuditLog_GetByUser", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@UserEmail", userEmail);
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<AuditLog>();
        while (await reader.ReadAsync()) results.Add(MapAuditLog(reader));
        return results;
    }

    public async Task<IEnumerable<AuditLog>> GetByDateRangeAsync(DateTime from, DateTime to)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_AuditLog_GetByDateRange", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@FromDate", from);
        cmd.Parameters.AddWithValue("@ToDate",   to);
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<AuditLog>();
        while (await reader.ReadAsync()) results.Add(MapAuditLog(reader));
        return results;
    }

    private static AuditLog MapAuditLog(SqlDataReader r) => new()
    {
        Id         = r.GetGuid(r.GetOrdinal("Id")),
        UserId     = r.IsDBNull(r.GetOrdinal("UserId"))    ? null : r.GetGuid(r.GetOrdinal("UserId")),
        UserEmail  = r.GetString(r.GetOrdinal("UserEmail")),
        Action     = r.GetString(r.GetOrdinal("Action")),
        EntityName = r.GetString(r.GetOrdinal("EntityName")),
        EntityId   = r.GetString(r.GetOrdinal("EntityId")),
        OldValues  = r.IsDBNull(r.GetOrdinal("OldValues")) ? null : r.GetString(r.GetOrdinal("OldValues")),
        NewValues  = r.IsDBNull(r.GetOrdinal("NewValues")) ? null : r.GetString(r.GetOrdinal("NewValues")),
        IpAddress  = r.IsDBNull(r.GetOrdinal("IpAddress")) ? null : r.GetString(r.GetOrdinal("IpAddress")),
        CreatedAt  = r.GetDateTime(r.GetOrdinal("CreatedAt"))
    };
}
