using ResellTracker.Core.Models;

namespace ResellTracker.Core.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
}
