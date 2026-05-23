using System.Data;
using Microsoft.Data.SqlClient;
using ResellTracker.Core.Interfaces.Repositories;
using ResellTracker.Core.Models;
using ResellTracker.Infrastructure.Data;

namespace ResellTracker.Infrastructure.Repositories;

public class SalesLogRepository : RepositoryBase, ISalesLogRepository
{
    public SalesLogRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<SaleLog>> GetAllAsync(Guid? platformId, Guid? categoryId, DateTime? fromDate, DateTime? toDate)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_SalesLog_GetAll", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@PlatformId", (object?)platformId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@CategoryId", (object?)categoryId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@FromDate",   (object?)fromDate   ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@ToDate",     (object?)toDate     ?? DBNull.Value);
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<SaleLog>();
        while (await reader.ReadAsync()) results.Add(MapSaleLog(reader));
        return results;
    }

    public async Task<SaleLog?> GetByIdAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_SalesLog_GetById", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id", id);
        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapSaleLog(reader) : null;
    }

    public async Task<Guid> InsertAsync(SaleLog sale)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_SalesLog_Insert", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@InventoryId", sale.InventoryId);
        cmd.Parameters.AddWithValue("@SalePrice",   sale.SalePrice);
        cmd.Parameters.AddWithValue("@PlatformId",  sale.PlatformId);
        cmd.Parameters.AddWithValue("@Postage",     sale.Postage);
        cmd.Parameters.AddWithValue("@DateSold",    sale.DateSold);
        var outId = new SqlParameter("@NewId", SqlDbType.UniqueIdentifier) { Direction = ParameterDirection.Output };
        cmd.Parameters.Add(outId);
        await cmd.ExecuteNonQueryAsync();
        return (Guid)outId.Value;
    }

    public async Task UpdateAsync(SaleLog sale)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_SalesLog_Update", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id",         sale.Id);
        cmd.Parameters.AddWithValue("@SalePrice",  sale.SalePrice);
        cmd.Parameters.AddWithValue("@PlatformId", sale.PlatformId);
        cmd.Parameters.AddWithValue("@Postage",    sale.Postage);
        cmd.Parameters.AddWithValue("@DateSold",   sale.DateSold);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_SalesLog_Delete", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id", id);
        await cmd.ExecuteNonQueryAsync();
    }

    private static SaleLog MapSaleLog(SqlDataReader r) => new()
    {
        Id            = r.GetGuid(r.GetOrdinal("Id")),
        InventoryId   = r.GetGuid(r.GetOrdinal("InventoryId")),
        SKU           = r.GetString(r.GetOrdinal("SKU")),
        SalePrice     = r.GetDecimal(r.GetOrdinal("SalePrice")),
        PlatformId    = r.GetGuid(r.GetOrdinal("PlatformId")),
        FeePercentage = r.GetDecimal(r.GetOrdinal("FeePercentage")),
        FixedFee      = r.GetDecimal(r.GetOrdinal("FixedFee")),
        Postage       = r.GetDecimal(r.GetOrdinal("Postage")),
        NetProfit     = r.GetDecimal(r.GetOrdinal("NetProfit")),
        DaysToSell    = r.GetInt32(r.GetOrdinal("DaysToSell")),
        DateSold      = r.GetDateTime(r.GetOrdinal("DateSold")),
        CreatedAt     = r.GetDateTime(r.GetOrdinal("CreatedAt")),
        Platform      = new Platform { Id = r.GetGuid(r.GetOrdinal("PlatformId")), Name = r.GetString(r.GetOrdinal("PlatformName")) },
        InventoryItem = new InventoryItem
        {
            Id    = r.GetGuid(r.GetOrdinal("InventoryId")),
            Brand = r.GetString(r.GetOrdinal("Brand")),
            Category = new Category { Name = r.GetString(r.GetOrdinal("CategoryName")) }
        }
    };
}
