using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResellTracker.Core.Constants;
using ResellTracker.Core.Interfaces;

namespace ResellTracker.API.Controllers;

[ApiController]
[Route("api/inventory")]
[Authorize(Roles = AppRoles.Owner + "," + AppRoles.Manager + "," + AppRoles.Lister + "," + AppRoles.Viewer)]
public class InventoryController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public InventoryController(IUnitOfWork uow) => _uow = uow;

    [HttpGet]
    public IActionResult GetAll() => Ok(new { message = "TODO" });

    [HttpGet("{id:guid}")]
    public IActionResult GetById(Guid id) => Ok(new { message = "TODO" });

    [HttpPost]
    [Authorize(Roles = AppRoles.Owner + "," + AppRoles.Manager + "," + AppRoles.Lister)]
    public IActionResult Create() => Ok(new { message = "TODO" });

    [HttpPut("{id:guid}")]
    [Authorize(Roles = AppRoles.Owner + "," + AppRoles.Manager + "," + AppRoles.Lister)]
    public IActionResult Update(Guid id) => Ok(new { message = "TODO" });

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AppRoles.Owner + "," + AppRoles.Manager)]
    public IActionResult Delete(Guid id) => Ok(new { message = "TODO" });
}
