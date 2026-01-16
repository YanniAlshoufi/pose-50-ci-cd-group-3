namespace WebApplication1.Contracts.Actors;

public record ActorCreateRequest(
    string FirstName,
    string LastName,
    DateOnly? BirthDate
);

