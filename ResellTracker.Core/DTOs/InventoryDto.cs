namespace ResellTracker.Core.DTOs;

public class InventoryRequestDto
{
    public string SKU { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string Size { get; set; } = string.Empty;
    public decimal Cogs { get; set; }
    public Guid? SupplierId { get; set; }
    public Guid? PlatformId { get; set; }
    public DateTime DateListed { get; set; }
    public string Status { get; set; } = string.Empty;
}

public class InventoryResponseDto
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Size { get; set; } = string.Empty;
    public decimal Cogs { get; set; }
    public Guid? SupplierId { get; set; }
    public string? SupplierName { get; set; }
    public Guid? PlatformId { get; set; }
    public string? PlatformName { get; set; }
    public DateTime DateListed { get; set; }
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
