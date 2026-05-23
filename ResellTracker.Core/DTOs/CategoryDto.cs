namespace ResellTracker.Core.DTOs;

public class CategoryRequestDto
{
    public string Name { get; set; } = string.Empty;
}

public class CategoryResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
