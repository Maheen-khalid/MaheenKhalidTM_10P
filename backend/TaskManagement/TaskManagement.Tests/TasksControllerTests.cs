using Xunit;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Models;
using TaskManagement.Controllers;
using TaskManagement.DTOs;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;

public class TasksControllerTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    private TasksController GetController(AppDbContext db, int userId, bool isAdmin)
    {
        var controller = new TasksController(db);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString())
        };

        if (isAdmin)
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));

        var identity = new ClaimsIdentity(claims, "TestAuth");
        var principal = new ClaimsPrincipal(identity);

        controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext
            {
                User = principal
            }
        };

        return controller;
    }

    [Fact]
    public async Task GetTask_ShouldReturnOk_WhenUserOwnsTask()
    {
        var db = GetDbContext();
        db.Tasks.Add(new TaskItem { Id = 1, Title = "Task1", UserId = 1 });
        db.SaveChanges();

        var controller = GetController(db, userId: 1, isAdmin: false);

        var result = await controller.GetTask(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var task = Assert.IsType<TaskItem>(okResult.Value);
        Assert.Equal("Task1", task.Title);
    }

    [Fact]
    public async Task GetTask_ShouldReturnNotFound_WhenTaskDoesNotExist()
    {
        var db = GetDbContext();
        var controller = GetController(db, userId: 1, isAdmin: false);

        var result = await controller.GetTask(99);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Task not found", notFound.Value);
    }

    [Fact]
    public async Task GetTask_ShouldReturnForbid_WhenUserDoesNotOwnTask()
    {
        var db = GetDbContext();
        db.Tasks.Add(new TaskItem { Id = 1, Title = "Task1", UserId = 2 });
        db.SaveChanges();

        var controller = GetController(db, userId: 1, isAdmin: false);

        var result = await controller.GetTask(1);

        Assert.IsType<ForbidResult>(result);
    }

    [Fact]
    public async Task Create_ShouldAddTask()
    {
        var db = GetDbContext();
        var controller = GetController(db, userId: 1, isAdmin: false);

        var dto = new TaskDto
        {
            Title = "New Task",
            Description = "Desc",
            Status = "Open",
            DueDate = DateTime.UtcNow
        };

        var result = await controller.Create(dto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var task = Assert.IsType<TaskItem>(okResult.Value);
        Assert.Equal("New Task", task.Title);
        Assert.Single(db.Tasks);
    }

    [Fact]
    public async Task Update_ShouldReturnOk_WhenValid()
    {
        var db = GetDbContext();
        db.Tasks.Add(new TaskItem { Id = 1, Title = "Old", UserId = 1 });
        db.SaveChanges();

        var controller = GetController(db, userId: 1, isAdmin: false);

        var dto = new TaskDto
        {
            Title = "Updated",
            Description = "Desc",
            Status = "In Progress",
            DueDate = DateTime.UtcNow
        };

        var result = await controller.Update(1, dto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        var updatedTask = Assert.IsType<TaskItem>(okResult.Value);
        Assert.Equal("Updated", updatedTask.Title);
    }

    [Fact]
    public async Task Update_ShouldReturnNotFound_WhenTaskDoesNotExist()
    {
        var db = GetDbContext();
        var controller = GetController(db, userId: 1, isAdmin: false);

        var dto = new TaskDto { Title = "No Task" };

        var result = await controller.Update(99, dto);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Task not found", notFound.Value);
    }

    [Fact]
    public async Task Delete_ShouldReturnOk_WhenValid()
    {
        var db = GetDbContext();
        db.Tasks.Add(new TaskItem { Id = 1, Title = "Delete Me", UserId = 1 });
        db.SaveChanges();

        var controller = GetController(db, userId: 1, isAdmin: false);

        var result = await controller.Delete(1);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("Deleted successfully", okResult.Value);
        Assert.Empty(db.Tasks);
    }

    [Fact]
    public async Task Delete_ShouldReturnNotFound_WhenTaskDoesNotExist()
    {
        var db = GetDbContext();
        var controller = GetController(db, userId: 1, isAdmin: false);

        var result = await controller.Delete(99);

        var notFound = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal("Task not found", notFound.Value);
    }
}
