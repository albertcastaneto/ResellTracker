using System.Data;
using Microsoft.Data.SqlClient;
using ResellTracker.Core.Interfaces.Repositories;
using ResellTracker.Core.Models;
using ResellTracker.Infrastructure.Data;

namespace ResellTracker.Infrastructure.Repositories;

public class SkuRepository : RepositoryBase, ISkuRepository
{
    public SkuRepository(AppDbContext context) : base(context) { }

    public async Task<int> GetNextSequenceAsync(string brandCode, string categoryCode, string supplierCode)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Sku_GetNextSequence", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@BrandCode",    brandCode);
        cmd.Parameters.AddWithValue("@CategoryCode", categoryCode);
        cmd.Parameters.AddWithValue("@SupplierCode", supplierCode);
        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? reader.GetInt32(0) : 1;
    }

    public async Task<Guid> InsertAsync(SkuRegistry sku)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Sku_Insert", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@SKU",            sku.SKU);
        cmd.Parameters.AddWithValue("@BrandCode",      sku.BrandCode);
        cmd.Parameters.AddWithValue("@CategoryCode",   sku.CategoryCode);
        cmd.Parameters.AddWithValue("@SizeCode",       sku.SizeCode);
        cmd.Parameters.AddWithValue("@SupplierCode",   sku.SupplierCode);
        cmd.Parameters.AddWithValue("@SequenceNumber", sku.SequenceNumber);
        cmd.Parameters.AddWithValue("@InventoryId",    (object?)sku.InventoryId ?? DBNull.Value);
        var outId = new SqlParameter("@NewId", SqlDbType.UniqueIdentifier) { Direction = ParameterDirection.Output };
        cmd.Parameters.Add(outId);
        await cmd.ExecuteNonQueryAsync();
        return (Guid)outId.Value;
    }

    public async Task<IEnumerable<SkuRegistry>> GetRecentAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Sku_GetRecent", conn) { CommandType = CommandType.StoredProcedure };
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<SkuRegistry>();
        while (await reader.ReadAsync()) results.Add(MapSku(reader));
        return results;
    }

    private static SkuRegistry MapSku(SqlDataReader r) => new()
    {
        Id             = r.GetGuid(r.GetOrdinal("Id")),
        SKU            = r.GetString(r.GetOrdinal("SKU")),
        BrandCode      = r.GetString(r.GetOrdinal("BrandCode")),
        CategoryCode   = r.GetString(r.GetOrdinal("CategoryCode")),
        SizeCode       = r.GetString(r.GetOrdinal("SizeCode")),
        SupplierCode   = r.GetString(r.GetOrdinal("SupplierCode")),
        SequenceNumber = r.GetInt32(r.GetOrdinal("SequenceNumber")),
        InventoryId    = r.IsDBNull(r.GetOrdinal("InventoryId")) ? null : r.GetGuid(r.GetOrdinal("InventoryId")),
        CreatedAt      = r.GetDateTime(r.GetOrdinal("CreatedAt"))
    };
}
