namespace ResellTracker.Core.Models;

public class SaleLog
{
    public Guid Id { get; set; }
    public Guid InventoryId { get; set; }
    public string SKU { get; set; } = string.Empty;
    public decimal SalePrice { get; set; }
    public Guid PlatformId { get; set; }
    public decimal FeePercentage { get; set; }
    public decimal FixedFee { get; set; }
    public decimal Postage { get; set; }
    public decimal NetProfit { get; set; }
    public int DaysToSell { get; set; }
    public DateTime DateSold { get; set; }
    public DateTime CreatedAt { get; set; }

    public InventoryItem InventoryItem { get; set; } = null!;
    public Platform Platform { get; set; } = null!;
}
