using System.Security.Claims;
using ResellTracker.Core.Interfaces;

namespace ResellTracker.API.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
        => _httpContextAccessor = httpContextAccessor;

    private ClaimsPrincipal? Principal => _httpContextAccessor.HttpContext?.User;

    public bool IsAuthenticated => Principal?.Identity?.IsAuthenticated == true;

    public Guid? UserId
    {
        get
        {
            var val = Principal?.FindFirst("sub")?.Value;
            return Guid.TryParse(val, out var id) ? id : null;
        }
    }

    public string? Email       => Principal?.FindFirst("email")?.Value;
    public string? Role        => Principal?.FindFirst("role")?.Value;
    public string? DisplayName => Principal?.FindFirst("name")?.Value;
}
