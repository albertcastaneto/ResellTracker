using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ResellTracker.Infrastructure.Data;

namespace ResellTracker.Infrastructure;

public class StoredProcedureRunner
{
    private readonly AppDbContext _context;
    private readonly ILogger<StoredProcedureRunner> _logger;

    public StoredProcedureRunner(AppDbContext context, ILogger<StoredProcedureRunner> logger)
    {
        _context = context;
        _logger  = logger;
    }

    public async Task RunAsync()
    {
        var spDir = Path.Combine(AppContext.BaseDirectory, "StoredProcedures");

        if (!Directory.Exists(spDir))
        {
            _logger.LogWarning("StoredProcedures directory not found at {Path}", spDir);
            return;
        }

        var files = Directory.GetFiles(spDir, "*.sql", SearchOption.AllDirectories)
                             .OrderBy(f => f)
                             .ToArray();

        _logger.LogInformation("Running {Count} stored procedures...", files.Length);

        foreach (var file in files)
        {
            var procName = Path.GetFileNameWithoutExtension(file);
            try
            {
                var sql = await File.ReadAllTextAsync(file);
                await _context.Database.ExecuteSqlRawAsync(sql);
                _logger.LogInformation("  ✓ {ProcName}", procName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "  ✗ {ProcName} failed", procName);
                throw;
            }
        }

        _logger.LogInformation("Stored procedures ready.");
    }
}
