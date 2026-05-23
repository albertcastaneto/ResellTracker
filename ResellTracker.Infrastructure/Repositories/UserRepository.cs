using System.Data;
using Microsoft.Data.SqlClient;
using ResellTracker.Core.Interfaces.Repositories;
using ResellTracker.Core.Models;
using ResellTracker.Infrastructure.Data;

namespace ResellTracker.Infrastructure.Repositories;

public class UserRepository : RepositoryBase, IUserRepository
{
    public UserRepository(AppDbContext context) : base(context) { }

    public async Task<User?> GetByEmailAsync(string email)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Users_GetByEmail", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Email", email);
        await using var reader = await cmd.ExecuteReaderAsync();
        return await reader.ReadAsync() ? MapUser(reader) : null;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Users_GetAll", conn) { CommandType = CommandType.StoredProcedure };
        await using var reader = await cmd.ExecuteReaderAsync();
        var results = new List<User>();
        while (await reader.ReadAsync()) results.Add(MapUser(reader));
        return results;
    }

    public async Task<Guid> InsertAsync(User user)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Users_Insert", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Email",       user.Email);
        cmd.Parameters.AddWithValue("@DisplayName", user.DisplayName);
        cmd.Parameters.AddWithValue("@Role",        user.Role);
        cmd.Parameters.AddWithValue("@Status",      user.Status);
        var outId = new SqlParameter("@NewId", SqlDbType.UniqueIdentifier) { Direction = ParameterDirection.Output };
        cmd.Parameters.Add(outId);
        await cmd.ExecuteNonQueryAsync();
        return (Guid)outId.Value;
    }

    public async Task UpdateRoleAsync(Guid id, string role)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Users_UpdateRole", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id",   id);
        cmd.Parameters.AddWithValue("@Role", role);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task UpdateStatusAsync(Guid id, string status)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Users_UpdateStatus", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id",     id);
        cmd.Parameters.AddWithValue("@Status", status);
        await cmd.ExecuteNonQueryAsync();
    }

    public async Task UpdateLastLoginAsync(Guid id)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Users_UpdateLastLogin", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Id", id);
        await cmd.ExecuteNonQueryAsync();
    }

    private static User MapUser(SqlDataReader r) => new()
    {
        Id          = r.GetGuid(r.GetOrdinal("Id")),
        Email       = r.GetString(r.GetOrdinal("Email")),
        DisplayName = r.GetString(r.GetOrdinal("DisplayName")),
        Role        = r.GetString(r.GetOrdinal("Role")),
        Status      = r.GetString(r.GetOrdinal("Status")),
        LastLogin   = r.IsDBNull(r.GetOrdinal("LastLogin")) ? null : r.GetDateTime(r.GetOrdinal("LastLogin")),
        CreatedAt   = r.GetDateTime(r.GetOrdinal("CreatedAt"))
    };
}
