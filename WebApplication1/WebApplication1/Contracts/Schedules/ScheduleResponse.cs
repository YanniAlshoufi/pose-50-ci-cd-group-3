namespace WebApplication1.Contracts.Schedules;

public record ScheduleResponse(
    int Id,
    int MovieId,
    string MovieTitle,
    int ActorId,
    string ActorName,
    DateTime StartsAt,
    string? Location
);

