using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResellTracker.Core.Constants;
using ResellTracker.Core.DTOs;
using ResellTracker.Core.Interfaces;
using ResellTracker.Core.Models;
using ResellTracker.Core.Services;

namespace ResellTracker.API.Controllers;

[ApiController]
[Route("api/suppliers")]
[Authorize(Roles = AppRoles.Owner + "," + AppRoles.Manager)]
public class SuppliersController : ControllerBase
{
    private readonly IUnitOfWork         _uow;
    private readonly AuditLogService     _audit;
    private readonly ICurrentUserService _cu;

    public SuppliersController(IUnitOfWork uow, AuditLogService audit, ICurrentUserService cu)
    {
        _uow   = uow;
        _audit = audit;
        _cu    = cu;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<SupplierResponseDto>>> GetAll([FromQuery] bool? isActive = null)
    {
        var items = await _uow.Suppliers.GetAllAsync(isActive);
        return Ok(items.Select(Map));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<SupplierResponseDto>> GetById(Guid id)
    {
        var item = await _uow.Suppliers.GetByIdAsync(id);
        if (item is null) return NotFound();
        return Ok(Map(item));
    }

    [HttpPost]
    public async Task<ActionResult<SupplierResponseDto>> Create([FromBody] SupplierRequestDto dto)
    {
        var supplier = new Supplier
        {
            Id        = Guid.NewGuid(),
            Name      = dto.Name,
            Type      = dto.Type,
            Location  = dto.Location,
            Notes     = dto.Notes,
            IsActive  = dto.IsActive,
            CreatedAt = DateTime.UtcNow
        };

        var newId = await _uow.Suppliers.InsertAsync(supplier);
        supplier.Id = newId;

        await _audit.LogActionAsync(_cu.Email!, _cu.UserId?.ToString(), AuditActions.Created,
            EntityNames.Supplier, newId.ToString(), newValues: dto,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return CreatedAtAction(nameof(GetById), new { id = newId }, Map(supplier));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SupplierRequestDto dto)
    {
        var existing = await _uow.Suppliers.GetByIdAsync(id);
        if (existing is null) return NotFound();

        var oldValues = Map(existing);

        existing.Name     = dto.Name;
        existing.Type     = dto.Type;
        existing.Location = dto.Location;
        existing.Notes    = dto.Notes;
        existing.IsActive = dto.IsActive;

        await _uow.Suppliers.UpdateAsync(existing);

        await _audit.LogActionAsync(_cu.Email!, _cu.UserId?.ToString(), AuditActions.Updated,
            EntityNames.Supplier, id.ToString(), oldValues: oldValues, newValues: dto,
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var existing = await _uow.Suppliers.GetByIdAsync(id);
        if (existing is null) return NotFound();

        await _uow.Suppliers.DeleteAsync(id);

        await _audit.LogActionAsync(_cu.Email!, _cu.UserId?.ToString(), AuditActions.Deleted,
            EntityNames.Supplier, id.ToString(), oldValues: Map(existing),
            ipAddress: HttpContext.Connection.RemoteIpAddress?.ToString());

        return NoContent();
    }

    private static SupplierResponseDto Map(Supplier s) => new()
    {
        Id        = s.Id,
        Name      = s.Name,
        Type      = s.Type,
        Location  = s.Location,
        Notes     = s.Notes,
        IsActive  = s.IsActive,
        CreatedAt = s.CreatedAt
    };
}
