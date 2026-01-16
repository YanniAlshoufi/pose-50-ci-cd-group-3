namespace WebApplication1.Models;

public class Movie
{
    public int Id { get; set; }

    public required string Title { get; set; }

    public string? Description { get; set; }

    public int DurationMinutes { get; set; }

    public DateOnly? ReleaseDate { get; set; }

    public ICollection<ScreeningSchedule> ScreeningSchedules { get; set; } = new List<ScreeningSchedule>();
}

