namespace ResellTracker.Core.Interfaces;

public interface ICurrentUserService
{
    Guid? UserId { get; }
    string? Email { get; }
    string? Role { get; }
    string? DisplayName { get; }
    bool IsAuthenticated { get; }
}
