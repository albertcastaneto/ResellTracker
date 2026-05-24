using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResellTracker.Core.Constants;
using ResellTracker.Core.DTOs;
using ResellTracker.Core.Interfaces;
using ResellTracker.Core.Models;
using ResellTracker.Core.Services;

namespace ResellTracker.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = AppRoles.Owner)]
public class UsersController : ControllerBase
{
    private readonly IUnitOfWork         _uow;
    private readonly AuditLogService     _audit;
    private readonly ICurrentUserService _cu;

    public UsersController(IUnitOfWork uow, AuditLogService audit, ICurrentUserService cu)
    {
        _uow   = uow;
        _audit = audit;
        _cu    = cu;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserResponseDto>>> GetAll()
    {
        var users = await _uow.Users.GetAllAsync();
        return Ok(users.Select(Map));
    }

    [HttpPost]
    public async Task<ActionResult<UserResponseDto>> Create([FromBody] UserRequestDto dto)
    {
        var user = new User
        {
            Id          = Guid.NewGuid(),
            Email       = dto.Email,
            DisplayName = dto.DisplayName,
            Role        = dto.Role,
            Status      = UserStatus.Active,
            CreatedAt   = DateTime.UtcNow
        };

        var newId = await _uow.Users.InsertAsync(user);
        user.Id = newId;

        await _audit.LogActionAsync(_cu.Email!, _cu.UserId?.ToString(), AuditActions.Created,
            EntityNames.User, newId.ToString(), newValues: dto,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return CreatedAtAction(nameof(GetAll), new { id = newId }, Map(user));
    }

    [HttpPut("{id:guid}/role")]
    public async Task<IActionResult> UpdateRole(Guid id, [FromBody] UpdateRoleRequestDto dto)
    {
        await _uow.Users.UpdateRoleAsync(id, dto.Role);

        await _audit.LogActionAsync(_cu.Email!, _cu.UserId?.ToString(), AuditActions.RoleChanged,
            EntityNames.User, id.ToString(), newValues: dto,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return NoContent();
    }

    [HttpPut("{id:guid}/status")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateStatusRequestDto dto)
    {
        if (_cu.UserId == id)
            return BadRequest(new { message = "Cannot change your own account status." });

        await _uow.Users.UpdateStatusAsync(id, dto.Status);

        await _audit.LogActionAsync(_cu.Email!, _cu.UserId?.ToString(),
            dto.Status == UserStatus.Active ? AuditActions.Reactivated : AuditActions.Deactivated,
            EntityNames.User, id.ToString(), newValues: dto,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        if (_cu.UserId == id)
            return BadRequest(new { message = "Cannot delete your own account." });

        await _uow.Users.DeleteAsync(id);

        await _audit.LogActionAsync(_cu.Email!, _cu.UserId?.ToString(), AuditActions.Deleted,
            EntityNames.User, id.ToString(),
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return NoContent();
    }

    private static UserResponseDto Map(User u) => new()
    {
        Id          = u.Id,
        Email       = u.Email,
        DisplayName = u.DisplayName,
        Role        = u.Role,
        Status      = u.Status,
        LastLogin   = u.LastLogin,
        CreatedAt   = u.CreatedAt
    };
}
