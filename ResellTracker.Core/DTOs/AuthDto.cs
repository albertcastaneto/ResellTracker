namespace ResellTracker.Core.DTOs;

public class DevLoginRequestDto
{
    public string Email { get; set; } = string.Empty;
}

public class MeResponseDto
{
    public Guid   UserId      { get; set; }
    public string Email       { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Role        { get; set; } = string.Empty;
}
