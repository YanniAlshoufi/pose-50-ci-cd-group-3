namespace WebApplication1.Contracts.Schedules;

public record ScheduleUpdateRequest(
    int MovieId,
    int ActorId,
    DateTime StartsAt,
    string? Location
);

