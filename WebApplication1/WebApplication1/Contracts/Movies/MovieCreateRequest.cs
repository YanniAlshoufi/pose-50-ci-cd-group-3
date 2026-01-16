namespace WebApplication1.Contracts.Movies;

public record MovieCreateRequest(
    string Title,
    string? Description,
    int DurationMinutes,
    DateOnly? ReleaseDate
);

