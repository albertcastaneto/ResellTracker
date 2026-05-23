using System.Data;
using Microsoft.Data.SqlClient;
using ResellTracker.Core.DTOs;
using ResellTracker.Core.Interfaces.Repositories;
using ResellTracker.Infrastructure.Data;

namespace ResellTracker.Infrastructure.Repositories;

public class ReportRepository : RepositoryBase, IReportRepository
{
    public ReportRepository(AppDbContext context) : base(context) { }

    public async Task<DashboardDto> GetDashboardKPIsAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Reports_DashboardKPIs", conn) { CommandType = CommandType.StoredProcedure };
        await using var r = await cmd.ExecuteReaderAsync();
        await r.ReadAsync();
        return new DashboardDto
        {
            TotalActiveListings  = r.GetInt32(r.GetOrdinal("TotalActiveListings")),
            TotalInventoryValue  = r.GetDecimal(r.GetOrdinal("TotalInventoryValue")),
            CashTiedInStock      = r.GetDecimal(r.GetOrdinal("CashTiedInStock")),
            MonthlyRevenue       = r.GetDecimal(r.GetOrdinal("CurrentMonthRevenue")),
            MonthlyProfit        = r.GetDecimal(r.GetOrdinal("CurrentMonthProfit")),
            SellThroughRate      = r.GetDecimal(r.GetOrdinal("OverallSellThroughRate")),
            TotalItemsSold       = r.GetInt32(r.GetOrdinal("TotalItemsSold")),
            AvgNetProfit         = r.GetDecimal(r.GetOrdinal("AvgNetProfit"))
        };
    }

    public async Task<IEnumerable<CategoryPerformanceDto>> GetCategoryPerformanceAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Reports_CategoryPerformance", conn) { CommandType = CommandType.StoredProcedure };
        await using var r = await cmd.ExecuteReaderAsync();
        var results = new List<CategoryPerformanceDto>();
        while (await r.ReadAsync())
        {
            results.Add(new CategoryPerformanceDto
            {
                CategoryName   = r.GetString(r.GetOrdinal("CategoryName")),
                TotalListed    = r.GetInt32(r.GetOrdinal("TotalListed")),
                TotalSold      = r.GetInt32(r.GetOrdinal("TotalSold")),
                SellThroughRate = r.GetDecimal(r.GetOrdinal("SellThroughRate")),
                AvgSalePrice   = r.GetDecimal(r.GetOrdinal("AvgSalePrice")),
                AvgCogs        = r.GetDecimal(r.GetOrdinal("AvgCogs")),
                AvgNetProfit   = r.GetDecimal(r.GetOrdinal("AvgNetProfit")),
                TotalRevenue   = r.GetDecimal(r.GetOrdinal("TotalRevenue")),
                TotalProfit    = r.GetDecimal(r.GetOrdinal("TotalProfit"))
            });
        }
        return results;
    }

    public async Task<IEnumerable<SupplierRoiDto>> GetSupplierROIAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Reports_SupplierROI", conn) { CommandType = CommandType.StoredProcedure };
        await using var r = await cmd.ExecuteReaderAsync();
        var results = new List<SupplierRoiDto>();
        while (await r.ReadAsync())
        {
            results.Add(new SupplierRoiDto
            {
                SupplierName  = r.GetString(r.GetOrdinal("SupplierName")),
                TotalBought   = r.GetInt32(r.GetOrdinal("TotalItemsBought")),
                TotalSpent    = r.GetDecimal(r.GetOrdinal("TotalSpent")),
                TotalSold     = r.GetInt32(r.GetOrdinal("TotalItemsSold")),
                TotalRevenue  = r.GetDecimal(r.GetOrdinal("TotalRevenue")),
                TotalProfit   = r.GetDecimal(r.GetOrdinal("TotalProfit")),
                RoiPercentage = r.GetDecimal(r.GetOrdinal("RoiPercentage"))
            });
        }
        return results;
    }

    public async Task<IEnumerable<SellThroughDto>> GetSellThroughAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Reports_SellThrough", conn) { CommandType = CommandType.StoredProcedure };
        await using var r = await cmd.ExecuteReaderAsync();
        var results = new List<SellThroughDto>();
        while (await r.ReadAsync())
        {
            results.Add(new SellThroughDto
            {
                CategoryName    = r.GetString(r.GetOrdinal("CategoryName")),
                TotalListed     = r.GetInt32(r.GetOrdinal("TotalListed")),
                TotalSold       = r.GetInt32(r.GetOrdinal("TotalSold")),
                SellThroughRate = r.GetDecimal(r.GetOrdinal("SellThroughRate")),
                AvgDaysToSell   = r.GetDecimal(r.GetOrdinal("AvgDaysToSell"))
            });
        }
        return results;
    }

    public async Task<IEnumerable<AgingStockDto>> GetAgingStockAsync()
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Reports_AgingStock", conn) { CommandType = CommandType.StoredProcedure };
        await using var r = await cmd.ExecuteReaderAsync();
        var results = new List<AgingStockDto>();
        while (await r.ReadAsync())
        {
            results.Add(new AgingStockDto
            {
                SKU        = r.GetString(r.GetOrdinal("SKU")),
                Brand      = r.GetString(r.GetOrdinal("Brand")),
                Category   = r.GetString(r.GetOrdinal("CategoryName")),
                DaysListed = r.GetInt32(r.GetOrdinal("DaysListed")),
                AgeBand    = r.GetString(r.GetOrdinal("AgeBand"))
            });
        }
        return results;
    }

    public async Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int months)
    {
        await using var conn = CreateConnection();
        await conn.OpenAsync();
        await using var cmd = new SqlCommand("usp_Reports_MonthlyRevenue", conn) { CommandType = CommandType.StoredProcedure };
        cmd.Parameters.AddWithValue("@Months", months);
        await using var r = await cmd.ExecuteReaderAsync();
        var results = new List<MonthlyRevenueDto>();
        while (await r.ReadAsync())
        {
            results.Add(new MonthlyRevenueDto
            {
                Year    = r.GetInt32(r.GetOrdinal("Year")),
                Month   = r.GetInt32(r.GetOrdinal("Month")),
                Revenue = r.GetDecimal(r.GetOrdinal("TotalRevenue")),
                Profit  = r.GetDecimal(r.GetOrdinal("TotalProfit"))
            });
        }
        return results;
    }
}
