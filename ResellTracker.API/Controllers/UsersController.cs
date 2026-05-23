using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResellTracker.Core.Constants;
using ResellTracker.Core.Interfaces;

namespace ResellTracker.API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = AppRoles.Owner)]
public class UsersController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public UsersController(IUnitOfWork uow) => _uow = uow;

    [HttpGet]
    public IActionResult GetAll() => Ok(new { message = "TODO" });

    [HttpPost]
    public IActionResult Create() => Ok(new { message = "TODO" });

    [HttpPut("{id:guid}/role")]
    public IActionResult UpdateRole(Guid id) => Ok(new { message = "TODO" });

    [HttpPut("{id:guid}/status")]
    public IActionResult UpdateStatus(Guid id) => Ok(new { message = "TODO" });
}
