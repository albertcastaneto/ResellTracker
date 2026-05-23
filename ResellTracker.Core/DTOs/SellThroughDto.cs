namespace ResellTracker.Core.DTOs;

public class SellThroughDto
{
    public string CategoryName { get; set; } = string.Empty;
    public int TotalListed { get; set; }
    public int TotalSold { get; set; }
    public decimal SellThroughRate { get; set; }
    public decimal AvgDaysToSell { get; set; }
}
