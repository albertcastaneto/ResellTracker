namespace ResellTracker.Core.Models;

public class Platform
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal FeePercentage { get; set; }
    public decimal FixedFee { get; set; }
    public decimal DefaultPostage { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
