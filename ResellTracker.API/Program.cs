using Microsoft.EntityFrameworkCore;
using ResellTracker.API.Extensions;
using ResellTracker.Core.Constants;
using ResellTracker.Core.Models;
using ResellTracker.Infrastructure;
using ResellTracker.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDatabase(builder.Configuration);
builder.Services.AddJwtAuthentication(builder.Configuration);
builder.Services.AddCorsPolicy();
builder.Services.AddSwagger();
builder.Services.AddApplicationServices();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    // Register or refresh all stored procedures
    using (var scope = app.Services.CreateScope())
    {
        var runner = scope.ServiceProvider.GetRequiredService<StoredProcedureRunner>();
        await runner.RunAsync();
    }

    // Seed default Owner user if none exist
    using (var scope = app.Services.CreateScope())
    {
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (!await db.Users.AnyAsync())
        {
            db.Users.Add(new User
            {
                Id          = Guid.NewGuid(),
                Email       = "owner@reselltracker.local",
                DisplayName = "Owner",
                Role        = AppRoles.Owner,
                Status      = "Active",
                CreatedAt   = DateTime.UtcNow
            });
            await db.SaveChangesAsync();
            app.Logger.LogInformation("Seeded default Owner user.");
        }
    }

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseGlobalErrorHandling();
app.UseRequestLogging();
app.UseHttpsRedirection();
app.UseCors("ViteClient");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
