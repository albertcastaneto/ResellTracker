using System.Data;
using Microsoft.Data.SqlClient;
using ResellTracker.Core.Interfaces.Repositories;
using ResellTracker.Core.Models;
using ResellTracker.Infrastructure.Data;

namespace ResellTracker.Infrastructure.Repositories;

public class InventoryRepository : RepositoryBase, IInventoryRepository
{
    public InventoryRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<InventoryItem>> GetAllAsync(string? status, Guid? categoryId, Guid? supplierId, Guid? platformId, string? search)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Inventory_GetAll", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Status",     (object?)status     ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@CategoryId", (object?)categoryId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@SupplierId", (object?)supplierId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PlatformId", (object?)platformId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Search",     (object?)search     ?? DBNull.Value);
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<InventoryItem>();
        while (await reader.ReadAsync()) results.Add(MapItem(reader));
        return results;
    }

    public async Task<InventoryItem?> GetByIdAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Inventory_GetById", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id", id);
        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapItem(reader) : null;
    }

    public async Task<IEnumerable<InventoryItem>> GetActiveAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Inventory_GetActive", conn) { CommandType = CommandType.StoredProcedure };
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<InventoryItem>();
        while (await reader.ReadAsync()) results.Add(MapItem(reader));
        return results;
    }

    public async Task<Guid> InsertAsync(InventoryItem item)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Inventory_Insert", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@SKU",        item.SKU);
        cmd.Parameters.AddWithValue("@Brand",      item.Brand);
        cmd.Parameters.AddWithValue("@CategoryId", item.CategoryId);
        cmd.Parameters.AddWithValue("@Size",       item.Size);
        cmd.Parameters.AddWithValue("@Cogs",       item.Cogs);
        cmd.Parameters.AddWithValue("@SupplierId", (object?)item.SupplierId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PlatformId", (object?)item.PlatformId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@DateListed", item.DateListed);
        cmd.Parameters.AddWithValue("@Status",     item.Status);
        var outId = new SqlParameter("@NewId", SqlDbType.UniqueIdentifier) { Direction = ParameterDirection.Output };
        cmd.Parameters.Add(outId);
        await cmd.ExecuteNonQueryAsync();
        return (Guid)outId.Value;
    }

    public async Task UpdateAsync(InventoryItem item)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Inventory_Update", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id",         item.Id);
        cmd.Parameters.AddWithValue("@SKU",        item.SKU);
        cmd.Parameters.AddWithValue("@Brand",      item.Brand);
        cmd.Parameters.AddWithValue("@CategoryId", item.CategoryId);
        cmd.Parameters.AddWithValue("@Size",       item.Size);
        cmd.Parameters.AddWithValue("@Cogs",       item.Cogs);
        cmd.Parameters.AddWithValue("@SupplierId", (object?)item.SupplierId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@PlatformId", (object?)item.PlatformId ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@DateListed", item.DateListed);
        cmd.Parameters.AddWithValue("@Status",     item.Status);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task UpdateStatusAsync(Guid id, string status)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Inventory_UpdateStatus", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id",     id);
        cmd.Parameters.AddWithValue("@Status", status);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Inventory_Delete", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id", id);
        await cmd.ExecuteNonQueryAsync();
    }

    private static InventoryItem MapItem(SqlDataReader r)
    {
        var suppId = r.IsDBNull(r.GetOrdinal("SupplierId")) ? (Guid?)null : r.GetGuid(r.GetOrdinal("SupplierId"));
        var platId = r.IsDBNull(r.GetOrdinal("PlatformId")) ? (Guid?)null : r.GetGuid(r.GetOrdinal("PlatformId"));
        return new InventoryItem
        {
            Id         = r.GetGuid(r.GetOrdinal("Id")),
            SKU        = r.GetString(r.GetOrdinal("SKU")),
            Brand      = r.GetString(r.GetOrdinal("Brand")),
            CategoryId = r.GetGuid(r.GetOrdinal("CategoryId")),
            Size       = r.GetString(r.GetOrdinal("Size")),
            Cogs       = r.GetDecimal(r.GetOrdinal("Cogs")),
            SupplierId = suppId,
            PlatformId = platId,
            DateListed = r.GetDateTime(r.GetOrdinal("DateListed")),
            Status     = r.GetString(r.GetOrdinal("Status")),
            CreatedAt  = r.GetDateTime(r.GetOrdinal("CreatedAt")),
            Category   = new Category { Id = r.GetGuid(r.GetOrdinal("CategoryId")), Name = r.GetString(r.GetOrdinal("CategoryName")) },
            Supplier   = suppId is null ? null : new Supplier { Id = suppId.Value, Name = r.GetString(r.GetOrdinal("SupplierName")) },
            Platform   = platId is null ? null : new Platform { Id = platId.Value, Name = r.GetString(r.GetOrdinal("PlatformName")) }
        };
    }
}
