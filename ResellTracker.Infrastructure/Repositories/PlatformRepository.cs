using System.Data;
using Microsoft.Data.SqlClient;
using ResellTracker.Core.Interfaces.Repositories;
using ResellTracker.Core.Models;
using ResellTracker.Infrastructure.Data;

namespace ResellTracker.Infrastructure.Repositories;

public class PlatformRepository : RepositoryBase, IPlatformRepository
{
    public PlatformRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Platform>> GetAllAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Platforms_GetAll", conn) { CommandType = CommandType.StoredProcedure };
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<Platform>();
        while (await reader.ReadAsync()) results.Add(MapPlatform(reader));
        return results;
    }

    public async Task<Platform?> GetByIdAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Platforms_GetById", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id", id);
        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapPlatform(reader) : null;
    }

    public async Task<Guid> InsertAsync(Platform platform)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Platforms_Insert", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Name",           platform.Name);
        cmd.Parameters.AddWithValue("@FeePercentage",  platform.FeePercentage);
        cmd.Parameters.AddWithValue("@FixedFee",       platform.FixedFee);
        cmd.Parameters.AddWithValue("@DefaultPostage", platform.DefaultPostage);
        cmd.Parameters.AddWithValue("@IsActive",       platform.IsActive);
        var outId = new SqlParameter("@NewId", SqlDbType.UniqueIdentifier) { Direction = ParameterDirection.Output };
        cmd.Parameters.Add(outId);
        await cmd.ExecuteNonQueryAsync();
        return (Guid)outId.Value;
    }

    public async Task UpdateAsync(Platform platform)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Platforms_Update", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id",             platform.Id);
        cmd.Parameters.AddWithValue("@Name",           platform.Name);
        cmd.Parameters.AddWithValue("@FeePercentage",  platform.FeePercentage);
        cmd.Parameters.AddWithValue("@FixedFee",       platform.FixedFee);
        cmd.Parameters.AddWithValue("@DefaultPostage", platform.DefaultPostage);
        cmd.Parameters.AddWithValue("@IsActive",       platform.IsActive);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Platforms_Delete", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id", id);
        await cmd.ExecuteNonQueryAsync();
    }

    private static Platform MapPlatform(SqlDataReader r) => new()
    {
        Id             = r.GetGuid(r.GetOrdinal("Id")),
        Name           = r.GetString(r.GetOrdinal("Name")),
        FeePercentage  = r.GetDecimal(r.GetOrdinal("FeePercentage")),
        FixedFee       = r.GetDecimal(r.GetOrdinal("FixedFee")),
        DefaultPostage = r.GetDecimal(r.GetOrdinal("DefaultPostage")),
        IsActive       = r.GetBoolean(r.GetOrdinal("IsActive")),
        CreatedAt      = r.GetDateTime(r.GetOrdinal("CreatedAt"))
    };
}
