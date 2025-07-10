public class TaskItem
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "To Do"; // "To Do", "In Progress", "Done"
    public DateTime DueDate { get; set; }

    public int UserId { get; set; }
    public User? User { get; set; }
}

