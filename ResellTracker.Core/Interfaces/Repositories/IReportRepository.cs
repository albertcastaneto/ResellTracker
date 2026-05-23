using ResellTracker.Core.DTOs;

namespace ResellTracker.Core.Interfaces.Repositories;

public interface IReportRepository
{
    Task<DashboardDto> GetDashboardKPIsAsync();
    Task<IEnumerable<CategoryPerformanceDto>> GetCategoryPerformanceAsync();
    Task<IEnumerable<SupplierRoiDto>> GetSupplierROIAsync();
    Task<IEnumerable<SellThroughDto>> GetSellThroughAsync();
    Task<IEnumerable<AgingStockDto>> GetAgingStockAsync();
    Task<IEnumerable<MonthlyRevenueDto>> GetMonthlyRevenueAsync(int months);
}
