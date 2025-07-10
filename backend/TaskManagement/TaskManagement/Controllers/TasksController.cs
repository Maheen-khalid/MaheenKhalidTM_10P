using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TaskManagement.DTOs;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly AppDbContext _context;

    public TasksController(AppDbContext context)
    {
        _context = context;
    }

    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private bool IsAdmin() => bool.Parse(User.FindFirstValue("IsAdmin")!);

    [HttpGet]
    public IActionResult GetTasks()
    {
        var userId = GetUserId();
        var tasks = IsAdmin()
            ? _context.Tasks.ToList()
            : _context.Tasks.Where(t => t.UserId == userId).ToList();

        return Ok(tasks);
    }

    [HttpPost]
    public IActionResult Create(TaskDto dto)
    {
        var task = new TaskItem
        {
            Title = dto.Title,
            Description = dto.Description,
            DueDate = dto.DueDate,
            Status = dto.Status,
            UserId = GetUserId()
        };

        _context.Tasks.Add(task);
        _context.SaveChanges();

        return Ok(task);
    }

    [HttpPut("{id}")]
    public IActionResult Update(int id, TaskDto dto)
    {
        var task = _context.Tasks.Find(id);
        if (task == null) return NotFound();

        if (!IsAdmin() && task.UserId != GetUserId())
            return Forbid();

        task.Title = dto.Title;
        task.Description = dto.Description;
        task.Status = dto.Status;
        task.DueDate = dto.DueDate;

        _context.SaveChanges();
        return Ok(task);
    }

    [HttpDelete("{id}")]
    public IActionResult Delete(int id)
    {
        var task = _context.Tasks.Find(id);
        if (task == null) return NotFound();

        if (!IsAdmin() && task.UserId != GetUserId())
            return Forbid();

        _context.Tasks.Remove(task);
        _context.SaveChanges();
        return Ok("Deleted");
    }
}
