using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResellTracker.Core.Constants;
using ResellTracker.Core.Interfaces;

namespace ResellTracker.API.Controllers;

[ApiController]
[Route("api/sku")]
[Authorize(Roles = AppRoles.Owner + "," + AppRoles.Manager + "," + AppRoles.Lister + "," + AppRoles.Viewer)]
public class SkuController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public SkuController(IUnitOfWork uow) => _uow = uow;

    [HttpGet]
    public IActionResult GetAll() => Ok(new { message = "TODO" });

    [HttpGet("{sku}")]
    public IActionResult GetBySku(string sku) => Ok(new { message = "TODO" });

    [HttpPost]
    [Authorize(Roles = AppRoles.Owner + "," + AppRoles.Manager + "," + AppRoles.Lister)]
    public IActionResult Generate() => Ok(new { message = "TODO" });
}
