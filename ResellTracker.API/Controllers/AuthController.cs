using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResellTracker.Core.Constants;
using ResellTracker.Core.DTOs;
using ResellTracker.Core.Interfaces;
using ResellTracker.Core.Services;

namespace ResellTracker.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUnitOfWork         _uow;
    private readonly IJwtService         _jwt;
    private readonly AuditLogService     _audit;
    private readonly IWebHostEnvironment _env;

    public AuthController(
        IUnitOfWork         uow,
        IJwtService         jwt,
        AuditLogService     audit,
        IWebHostEnvironment env)
    {
        _uow   = uow;
        _jwt   = jwt;
        _audit = audit;
        _env   = env;
    }

    [HttpPost("dev-login")]
    public async Task<IActionResult> DevLogin([FromBody] DevLoginRequestDto request)
    {
        if (!_env.IsDevelopment())
            return NotFound();

        var user = await _uow.Users.GetByEmailAsync(request.Email);
        if (user is null)
            return Unauthorized(new { message = "User not found." });

        if (user.Status != UserStatus.Active)
            return Unauthorized(new { message = "Account is not active." });

        await _uow.Users.UpdateLastLoginAsync(user.Id);

        var ip    = HttpContext.Connection.RemoteIpAddress?.ToString();
        var token = _jwt.GenerateToken(user);

        await _audit.LogActionAsync(
            userEmail:  user.Email,
            userId:     user.Id.ToString(),
            action:     AuditActions.Login,
            entityName: EntityNames.User,
            entityId:   user.Id.ToString(),
            ipAddress:  ip);

        return Ok(new { token });
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me()
    {
        var userId      = User.FindFirst("sub")?.Value;
        var email       = User.FindFirst("email")?.Value;
        var displayName = User.FindFirst("name")?.Value;
        var role        = User.FindFirst("role")?.Value;

        if (userId is null || email is null)
            return Unauthorized();

        return Ok(new MeResponseDto
        {
            UserId      = Guid.Parse(userId),
            Email       = email,
            DisplayName = displayName ?? string.Empty,
            Role        = role        ?? string.Empty
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirst("sub")?.Value;
        var email  = User.FindFirst("email")?.Value ?? string.Empty;
        var ip     = HttpContext.Connection.RemoteIpAddress?.ToString();

        await _audit.LogActionAsync(
            userEmail:  email,
            userId:     userId,
            action:     AuditActions.Logout,
            entityName: EntityNames.User,
            entityId:   userId ?? string.Empty,
            ipAddress:  ip);

        return NoContent();
    }
}
