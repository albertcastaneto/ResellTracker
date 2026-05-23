namespace ResellTracker.Core.DTOs;

public class DashboardDto
{
    public int TotalActiveListings { get; set; }
    public decimal TotalInventoryValue { get; set; }
    public decimal CashTiedInStock { get; set; }
    public decimal MonthlyRevenue { get; set; }
    public decimal MonthlyProfit { get; set; }
    public decimal SellThroughRate { get; set; }
    public int TotalItemsSold { get; set; }
    public decimal AvgNetProfit { get; set; }
}

public class CategoryPerformanceDto
{
    public string CategoryName { get; set; } = string.Empty;
    public int TotalListed { get; set; }
    public int TotalSold { get; set; }
    public decimal SellThroughRate { get; set; }
    public decimal AvgSalePrice { get; set; }
    public decimal AvgCogs { get; set; }
    public decimal AvgNetProfit { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalProfit { get; set; }
}

public class SupplierRoiDto
{
    public string SupplierName { get; set; } = string.Empty;
    public int TotalBought { get; set; }
    public decimal TotalSpent { get; set; }
    public int TotalSold { get; set; }
    public decimal TotalRevenue { get; set; }
    public decimal TotalProfit { get; set; }
    public decimal RoiPercentage { get; set; }
}

public class AgingStockDto
{
    public string SKU { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int DaysListed { get; set; }
    public string AgeBand { get; set; } = string.Empty;
}

public class MonthlyRevenueDto
{
    public int Month { get; set; }
    public int Year { get; set; }
    public decimal Revenue { get; set; }
    public decimal Profit { get; set; }
}
