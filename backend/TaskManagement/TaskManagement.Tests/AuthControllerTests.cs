using Xunit;
using TaskManagement.Controllers;
using TaskManagement.DTOs;
using Microsoft.Extensions.Configuration;
using Microsoft.EntityFrameworkCore;
using TaskManagement.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

public class AuthControllerTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: System.Guid.NewGuid().ToString()) // unique db per test
            .Options;

        return new AppDbContext(options);
    }

    private IConfiguration GetConfig()
    {
        var inMemorySettings = new Dictionary<string, string?>
        {
            {"Jwt:Key", "Helloguysthisisasupersecretejwtkeywhichiknowyoucantcrack"},
            {"Jwt:Issuer", "TestIssuer"},
            {"Jwt:Audience", "TestAudience"}
        };

        return new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();
    }

    private AuthController GetController(AppDbContext db, IConfiguration config, ClaimsPrincipal? user = null)
    {
        var controller = new AuthController(db, config);
        if (user != null)
        {
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }
        return controller;
    }

    [Fact]
    public void Register_ShouldAddUser_WhenValid()
    {
        var db = GetDbContext();
        var config = GetConfig();
        var controller = GetController(db, config);

        var dto = new RegisterDto
        {
            Username = "testuser",
            Email = "test@example.com",
            Password = "password123"
        };

        var result = controller.Register(dto);

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal("User registered successfully", okResult.Value);
        Assert.Single(db.Users);
    }

    [Fact]
    public void Register_ShouldFail_WhenEmailExists()
    {
        var db = GetDbContext();
        db.Users.Add(new User { Username = "existing", Email = "test@example.com", PasswordHash = "hash" });
        db.SaveChanges();

        var config = GetConfig();
        var controller = GetController(db, config);

        var dto = new RegisterDto
        {
            Username = "newuser",
            Email = "test@example.com",
            Password = "password123"
        };

        var result = controller.Register(dto);

        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal("Email already exists", badResult.Value);
    }

    [Fact]
    public void Login_ShouldReturnToken_WhenValidCredentials()
    {
        // Arrange
        var db = GetDbContext();
        var config = GetConfig();

        // Add a test user
        var password = "password123";
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword(password);
        db.Users.Add(new User
        {
            Username = "testuser",
            Email = "test@example.com",
            PasswordHash = hashedPassword,
            IsAdmin = false
        });
        db.SaveChanges();

        var controller = new AuthController(db, config);
        var dto = new LoginDto
        {
            Email = "test@example.com",
            Password = password
        };

        // Act
        var result = controller.Login(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        // Serialize & check token
        var resultDict = okResult.Value
            .GetType()
            .GetProperties()
            .ToDictionary(p => p.Name, p => p.GetValue(okResult.Value));

        Assert.True(resultDict.ContainsKey("token"));
        Assert.False(string.IsNullOrWhiteSpace(resultDict["token"]?.ToString()));
    }


    [Fact]
    public void Login_ShouldFail_WhenPasswordIsWrong()
    {
        var db = GetDbContext();
        var hashedPassword = BCrypt.Net.BCrypt.HashPassword("password123");
        db.Users.Add(new User { Username = "user1", Email = "user1@example.com", PasswordHash = hashedPassword });
        db.SaveChanges();

        var config = GetConfig();
        var controller = GetController(db, config);

        var dto = new LoginDto { Email = "user1@example.com", Password = "wrongpass" };

        var result = controller.Login(dto);

        var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
        Assert.Equal("Invalid credentials", unauthorizedResult.Value);
    }

    [Fact]
    public void GetAllUsers_ShouldReturnData_WhenAdmin()
    {
        var db = GetDbContext();
        db.Users.Add(new User { Username = "admin", Email = "admin@example.com", PasswordHash = "hash", IsAdmin = true });
        db.SaveChanges();

        var config = GetConfig();
        var claims = new List<Claim> { new Claim(ClaimTypes.Role, "Admin") };
        var identity = new ClaimsIdentity(claims, "mock");
        var user = new ClaimsPrincipal(identity);

        var controller = GetController(db, config, user);

        var result = controller.GetAllUsers();

        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.NotEmpty((IEnumerable<object>)okResult.Value);
    }
}
