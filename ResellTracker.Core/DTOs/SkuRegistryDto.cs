namespace ResellTracker.Core.DTOs;

public class SkuRegistryRequestDto
{
    public string SKU { get; set; } = string.Empty;
    public string BrandCode { get; set; } = string.Empty;
    public string CategoryCode { get; set; } = string.Empty;
    public string SizeCode { get; set; } = string.Empty;
    public string SupplierCode { get; set; } = string.Empty;
    public int SequenceNumber { get; set; }
    public Guid? InventoryId { get; set; }
}

public class SkuRegistryResponseDto
{
    public Guid Id { get; set; }
    public string SKU { get; set; } = string.Empty;
    public string BrandCode { get; set; } = string.Empty;
    public string CategoryCode { get; set; } = string.Empty;
    public string SizeCode { get; set; } = string.Empty;
    public string SupplierCode { get; set; } = string.Empty;
    public int SequenceNumber { get; set; }
    public Guid? InventoryId { get; set; }
    public DateTime CreatedAt { get; set; }
}
