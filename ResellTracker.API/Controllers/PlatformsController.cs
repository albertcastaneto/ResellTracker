using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResellTracker.Core.Constants;
using ResellTracker.Core.DTOs;
using ResellTracker.Core.Interfaces;
using ResellTracker.Core.Models;
using ResellTracker.Core.Services;

namespace ResellTracker.API.Controllers;

[ApiController]
[Route("api/platforms")]
[Authorize(Roles = AppRoles.Owner + "," + AppRoles.Manager)]
public class PlatformsController : ControllerBase
{
    private readonly IUnitOfWork        _uow;
    private readonly AuditLogService    _audit;
    private readonly ICurrentUserService _cu;

    public PlatformsController(IUnitOfWork uow, AuditLogService audit, ICurrentUserService cu)
    {
        _uow   = uow;
        _audit = audit;
        _cu    = cu;
    }

    [HttpGet]
    [Authorize(Roles = AppRoles.Owner + "," + AppRoles.Manager + "," + AppRoles.Lister + "," + AppRoles.Viewer)]
    public async Task<ActionResult<IEnumerable<PlatformResponseDto>>> GetAll()
    {
        var items = await _uow.Platforms.GetAllAsync();
        return Ok(items.Select(Map));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Roles = AppRoles.Owner + "," + AppRoles.Manager + "," + AppRoles.Lister + "," + AppRoles.Viewer)]
    public async Task<ActionResult<PlatformResponseDto>> GetById(Guid id)
    {
        var item = await _uow.Platforms.GetByIdAsync(id);
        if (item is null) return NotFound();
        return Ok(Map(item));
    }

    [HttpPost]
    public async Task<ActionResult<PlatformResponseDto>> Create([FromBody] PlatformRequestDto dto)
    {
        var platform = new Platform
        {
            Id             = Guid.NewGuid(),
            Name           = dto.Name,
            FeePercentage  = dto.FeePercentage,
            FixedFee       = dto.FixedFee,
            DefaultPostage = dto.DefaultPostage,
            IsActive       = dto.IsActive,
            CreatedAt      = DateTime.UtcNow
        };

        var newId = await _uow.Platforms.InsertAsync(platform);
        platform.Id = newId;

        await _audit.LogActionAsync(_cu.Email!, _cu.UserId?.ToString(), AuditActions.Created,
            EntityNames.Platform, newId.ToString(), newValues: dto, ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return CreatedAtAction(nameof(GetById), new { id = newId }, Map(platform));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] PlatformRequestDto dto)
    {
        var existing = await _uow.Platforms.GetByIdAsync(id);
        if (existing is null) return NotFound();

        var oldValues = Map(existing);

        existing.Name           = dto.Name;
        existing.FeePercentage  = dto.FeePercentage;
        existing.FixedFee       = dto.FixedFee;
        existing.DefaultPostage = dto.DefaultPostage;
        existing.IsActive       = dto.IsActive;

        await _uow.Platforms.UpdateAsync(existing);

        await _audit.LogActionAsync(_cu.Email!, _cu.UserId?.ToString(), AuditActions.Updated,
            EntityNames.Platform, id.ToString(), oldValues: oldValues, newValues: dto,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _uow.Platforms.GetByIdAsync(id);
        if (existing is null) return NotFound();

        await _uow.Platforms.DeleteAsync(id);

        await _audit.LogActionAsync(_cu.Email!, _cu.UserId?.ToString(), AuditActions.Deleted,
            EntityNames.Platform, id.ToString(), oldValues: Map(existing),
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return NoContent();
    }

    private static PlatformResponseDto Map(Platform p) => new()
    {
        Id             = p.Id,
        Name           = p.Name,
        FeePercentage  = p.FeePercentage,
        FixedFee       = p.FixedFee,
        DefaultPostage = p.DefaultPostage,
        IsActive       = p.IsActive,
        CreatedAt      = p.CreatedAt
    };
}
