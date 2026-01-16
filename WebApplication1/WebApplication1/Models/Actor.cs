namespace WebApplication1.Models;

public class Actor
{
    public int Id { get; set; }

    public required string FirstName { get; set; }

    public required string LastName { get; set; }

    public DateOnly? BirthDate { get; set; }

    public ICollection<ScreeningSchedule> ScreeningSchedules { get; set; } = new List<ScreeningSchedule>();
}

