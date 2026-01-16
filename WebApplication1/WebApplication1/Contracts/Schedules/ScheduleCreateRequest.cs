namespace WebApplication1.Contracts.Schedules;

public record ScheduleCreateRequest(
    int MovieId,
    int ActorId,
    DateTime StartsAt,
    string? Location
);

