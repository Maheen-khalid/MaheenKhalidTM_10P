using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using TaskManagement.DTOs;
using TaskManagement.Models;

namespace TaskManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TasksController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TasksController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        private bool IsAdmin() =>
            User.IsInRole("Admin");

        // ✅ Get specific task by ID
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetTask(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound("Task not found");

            if (!IsAdmin() && task.UserId != GetUserId())
                return Forbid();

            return Ok(task);
        }

        // ✅ Get all tasks
        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetTasks()
        {
            var userId = GetUserId();

            var tasks = IsAdmin()
                ? await _context.Tasks.Include(t => t.User).ToListAsync()
                : await _context.Tasks.Where(t => t.UserId == userId).ToListAsync();

            return Ok(tasks);
        }

        // ✅ Create new task
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create(TaskDto dto)
        {
            var task = new TaskItem
            {
                Title = dto.Title,
                Description = dto.Description,
                Status = dto.Status,
                DueDate = dto.DueDate,
                UserId = GetUserId()
            };

            _context.Tasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(task);
        }

        // ✅ Update task
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, TaskDto dto)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound("Task not found");

            if (!IsAdmin() && task.UserId != GetUserId())
                return Forbid();

            task.Title = dto.Title;
            task.Description = dto.Description;
            task.Status = dto.Status;
            task.DueDate = dto.DueDate;

            await _context.SaveChangesAsync();
            return Ok(task);
        }

        // ✅ Delete task
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var task = await _context.Tasks.FindAsync(id);
            if (task == null)
                return NotFound("Task not found");

            if (!IsAdmin() && task.UserId != GetUserId())
                return Forbid();

            _context.Tasks.Remove(task);
            await _context.SaveChangesAsync();
            return Ok("Deleted successfully");
        }
    }
}
