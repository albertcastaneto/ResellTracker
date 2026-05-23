using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResellTracker.Core.Constants;
using ResellTracker.Core.DTOs;
using ResellTracker.Core.Interfaces;

namespace ResellTracker.API.Controllers;

[ApiController]
[Route("api/audit")]
[Authorize(Roles = AppRoles.Owner)]
public class AuditLogController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public AuditLogController(IUnitOfWork uow) => _uow = uow;

    [HttpGet]
    public async Task<ActionResult<PagedResultDto<AuditLogResponseDto>>> GetAll(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize   = 50)
    {
        var result = await _uow.AuditLog.GetAllAsync(pageNumber, pageSize);
        return Ok(new PagedResultDto<AuditLogResponseDto>
        {
            Items      = result.Items.Select(MapResponse),
            TotalCount = result.TotalCount,
            PageNumber = result.PageNumber,
            PageSize   = result.PageSize
        });
    }

    [HttpGet("entity/{entityName}/{entityId}")]
    public async Task<ActionResult<IEnumerable<AuditLogResponseDto>>> GetByEntity(string entityName, string entityId)
    {
        var items = await _uow.AuditLog.GetByEntityAsync(entityName, entityId);
        return Ok(items.Select(MapResponse));
    }

    [HttpGet("user/{email}")]
    public async Task<ActionResult<IEnumerable<AuditLogResponseDto>>> GetByUser(string email)
    {
        var items = await _uow.AuditLog.GetByUserAsync(email);
        return Ok(items.Select(MapResponse));
    }

    [HttpGet("daterange")]
    public async Task<ActionResult<IEnumerable<AuditLogResponseDto>>> GetByDateRange(
        [FromQuery] DateTime from,
        [FromQuery] DateTime to)
    {
        var items = await _uow.AuditLog.GetByDateRangeAsync(from, to);
        return Ok(items.Select(MapResponse));
    }

    private static AuditLogResponseDto MapResponse(Core.Models.AuditLog a) => new()
    {
        Id         = a.Id,
        UserId     = a.UserId,
        UserEmail  = a.UserEmail,
        Action     = a.Action,
        EntityName = a.EntityName,
        EntityId   = a.EntityId,
        OldValues  = a.OldValues,
        NewValues  = a.NewValues,
        IpAddress  = a.IpAddress,
        CreatedAt  = a.CreatedAt
    };
}
