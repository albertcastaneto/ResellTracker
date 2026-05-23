namespace ResellTracker.Core.Models;

public class InventoryItem
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string Size { get; set; } = string.Empty;
    public decimal Cogs { get; set; }
    public Guid? SupplierId { get; set; }
    public Guid? PlatformId { get; set; }
    public DateTime DateListed { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }

    public Category Category { get; set; } = null!;
    public Supplier? Supplier { get; set; }
    public Platform? Platform { get; set; }
}
