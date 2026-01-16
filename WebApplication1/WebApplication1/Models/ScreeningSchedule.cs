namespace WebApplication1.Models;

public class ScreeningSchedule
{
    public int Id { get; set; }

    public int MovieId { get; set; }
    public Movie? Movie { get; set; }

    public int ActorId { get; set; }
    public Actor? Actor { get; set; }

    public DateTime StartsAt { get; set; }

    public string? Location { get; set; }
}

