namespace WebApplication1.Contracts.Movies;

public record MovieUpdateRequest(
    string Title,
    string? Description,
    int DurationMinutes,
    DateOnly? ReleaseDate
);

