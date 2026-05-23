using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using ResellTracker.Infrastructure.Data;

namespace ResellTracker.Infrastructure.Repositories;

public abstract class RepositoryBase
{
    protected readonly AppDbContext Context;

    protected RepositoryBase(AppDbContext context) => Context = context;

    protected SqlConnection CreateConnection() =>
        new(Context.Database.GetDbConnection().ConnectionString);
}
