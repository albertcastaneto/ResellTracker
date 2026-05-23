using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ResellTracker.Core.Constants;
using ResellTracker.Core.Interfaces;

namespace ResellTracker.API.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize(Roles = AppRoles.Owner + "," + AppRoles.Manager)]
public class ReportsController : ControllerBase
{
    private readonly IUnitOfWork _uow;

    public ReportsController(IUnitOfWork uow) => _uow = uow;

    [HttpGet("dashboard")]
    public IActionResult Dashboard() => Ok(new { message = "TODO" });

    [HttpGet("aging-stock")]
    public IActionResult AgingStock() => Ok(new { message = "TODO" });

    [HttpGet("profit-by-platform")]
    public IActionResult ProfitByPlatform() => Ok(new { message = "TODO" });

    [HttpGet("profit-by-supplier")]
    public IActionResult ProfitBySupplier() => Ok(new { message = "TODO" });

    [HttpGet("profit-by-category")]
    public IActionResult ProfitByCategory() => Ok(new { message = "TODO" });

    [HttpGet("monthly-summary")]
    public IActionResult MonthlySummary() => Ok(new { message = "TODO" });

    [HttpGet("top-performers")]
    public IActionResult TopPerformers() => Ok(new { message = "TODO" });
}
