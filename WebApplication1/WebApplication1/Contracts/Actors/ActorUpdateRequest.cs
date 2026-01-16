namespace WebApplication1.Contracts.Actors;

public record ActorUpdateRequest(
    string FirstName,
    string LastName,
    DateOnly? BirthDate
);

