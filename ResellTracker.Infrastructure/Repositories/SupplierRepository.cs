using System.Data;
using Microsoft.Data.SqlClient;
using ResellTracker.Core.Interfaces.Repositories;
using ResellTracker.Core.Models;
using ResellTracker.Infrastructure.Data;

namespace ResellTracker.Infrastructure.Repositories;

public class SupplierRepository : RepositoryBase, ISupplierRepository
{
    public SupplierRepository(AppDbContext context) : base(context) { }

    public async Task<IEnumerable<Supplier>> GetAllAsync(bool? isActive)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Suppliers_GetAll", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@IsActive", isActive.HasValue ? (object)(isActive.Value ? 1 : 0) : DBNull.Value);
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<Supplier>();
        while (await reader.ReadAsync()) results.Add(MapSupplier(reader));
        return results;
    }

    public async Task<Supplier?> GetByIdAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Suppliers_GetById", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id", id);
        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapSupplier(reader) : null;
    }

    public async Task<Guid> InsertAsync(Supplier supplier)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Suppliers_Insert", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Name",     supplier.Name);
        cmd.Parameters.AddWithValue("@Type",     supplier.Type);
        cmd.Parameters.AddWithValue("@Location", (object?)supplier.Location ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Notes",    (object?)supplier.Notes    ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@IsActive", supplier.IsActive);
        var outId = new SqlParameter("@NewId", SqlDbType.UniqueIdentifier) { Direction = ParameterDirection.Output };
        cmd.Parameters.Add(outId);
        await cmd.ExecuteNonQueryAsync();
        return (Guid)outId.Value;
    }

    public async Task UpdateAsync(Supplier supplier)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Suppliers_Update", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id",       supplier.Id);
        cmd.Parameters.AddWithValue("@Name",     supplier.Name);
        cmd.Parameters.AddWithValue("@Type",     supplier.Type);
        cmd.Parameters.AddWithValue("@Location", (object?)supplier.Location ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@Notes",    (object?)supplier.Notes    ?? DBNull.Value);
        cmd.Parameters.AddWithValue("@IsActive", supplier.IsActive);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Suppliers_Delete", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id", id);
        await cmd.ExecuteNonQueryAsync();
    }

    private static Supplier MapSupplier(SqlDataReader r) => new()
    {
        Id        = r.GetGuid(r.GetOrdinal("Id")),
        Name      = r.GetString(r.GetOrdinal("Name")),
        Type      = r.GetString(r.GetOrdinal("Type")),
        Location  = r.IsDBNull(r.GetOrdinal("Location")) ? null : r.GetString(r.GetOrdinal("Location")),
        Notes     = r.IsDBNull(r.GetOrdinal("Notes"))    ? null : r.GetString(r.GetOrdinal("Notes")),
        IsActive  = r.GetBoolean(r.GetOrdinal("IsActive")),
        CreatedAt = r.GetDateTime(r.GetOrdinal("CreatedAt"))
    };
}
