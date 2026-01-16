using Microsoft.EntityFrameworkCore;
using WebApplication1.Contracts.Actors;
using WebApplication1.Contracts.Movies;
using WebApplication1.Contracts.Schedules;
using WebApplication1.Data;
using WebApplication1.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddDbContext<AppDbContext>(options =>
{
    var cs = builder.Configuration.GetConnectionString("Default");
    options.UseSqlite(cs);
});

var app = builder.Build();

// Ensure database exists (simple local dev-friendly setup; migrations can be added later)
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// API versioning via route prefix
var apiV1 = app.MapGroup("/api/v1");

// -------------------- Movies --------------------
var movies = apiV1.MapGroup("/movies").WithTags("Movies");

// Create
movies.MapPost("", async (MovieCreateRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
        return Results.BadRequest("Title is required");

    if (request.DurationMinutes < 0)
        return Results.BadRequest("DurationMinutes must be >= 0");

    var movie = new Movie
    {
        Title = request.Title.Trim(),
        Description = request.Description,
        DurationMinutes = request.DurationMinutes,
        ReleaseDate = request.ReleaseDate
    };

    db.Movies.Add(movie);
    await db.SaveChangesAsync();

    return Results.Created($"/api/v1/movies/{movie.Id}", movie);
});

// Get (all)
movies.MapGet("", async (AppDbContext db) =>
{
    var list = await db.Movies
        .AsNoTracking()
        .OrderBy(m => m.Id)
        .ToListAsync();

    return Results.Ok(list);
});

// Update
movies.MapPut("/{id:int}", async (int id, MovieUpdateRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.Title))
        return Results.BadRequest("Title is required");

    if (request.DurationMinutes < 0)
        return Results.BadRequest("DurationMinutes must be >= 0");

    var movie = await db.Movies.FirstOrDefaultAsync(m => m.Id == id);
    if (movie is null)
        return Results.NotFound();

    movie.Title = request.Title.Trim();
    movie.Description = request.Description;
    movie.DurationMinutes = request.DurationMinutes;
    movie.ReleaseDate = request.ReleaseDate;

    await db.SaveChangesAsync();

    return Results.Ok(movie);
});

// Delete
movies.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
{
    var movie = await db.Movies.FirstOrDefaultAsync(m => m.Id == id);
    if (movie is null)
        return Results.NotFound();

    db.Movies.Remove(movie);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// -------------------- Actors --------------------
var actors = apiV1.MapGroup("/actors").WithTags("Actors");

// Create
actors.MapPost("", async (ActorCreateRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
        return Results.BadRequest("FirstName and LastName are required");

    var actor = new Actor
    {
        FirstName = request.FirstName.Trim(),
        LastName = request.LastName.Trim(),
        BirthDate = request.BirthDate
    };

    db.Actors.Add(actor);
    await db.SaveChangesAsync();

    return Results.Created($"/api/v1/actors/{actor.Id}", actor);
});

// Get (all)
actors.MapGet("", async (AppDbContext db) =>
{
    var list = await db.Actors
        .AsNoTracking()
        .OrderBy(a => a.Id)
        .ToListAsync();

    return Results.Ok(list);
});

// Update
actors.MapPut("/{id:int}", async (int id, ActorUpdateRequest request, AppDbContext db) =>
{
    if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.LastName))
        return Results.BadRequest("FirstName and LastName are required");

    var actor = await db.Actors.FirstOrDefaultAsync(a => a.Id == id);
    if (actor is null)
        return Results.NotFound();

    actor.FirstName = request.FirstName.Trim();
    actor.LastName = request.LastName.Trim();
    actor.BirthDate = request.BirthDate;

    await db.SaveChangesAsync();

    return Results.Ok(actor);
});

// Delete
actors.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
{
    var actor = await db.Actors.FirstOrDefaultAsync(a => a.Id == id);
    if (actor is null)
        return Results.NotFound();

    db.Actors.Remove(actor);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

// -------------------- Screening schedules --------------------
var schedules = apiV1.MapGroup("/schedules").WithTags("ScreeningSchedules");

// Create
schedules.MapPost("", async (ScheduleCreateRequest request, AppDbContext db) =>
{
    if (request.StartsAt == default)
        return Results.BadRequest("StartsAt is required");

    var movieExists = await db.Movies.AnyAsync(m => m.Id == request.MovieId);
    if (!movieExists)
        return Results.BadRequest($"MovieId {request.MovieId} does not exist");

    var actorExists = await db.Actors.AnyAsync(a => a.Id == request.ActorId);
    if (!actorExists)
        return Results.BadRequest($"ActorId {request.ActorId} does not exist");

    var schedule = new ScreeningSchedule
    {
        MovieId = request.MovieId,
        ActorId = request.ActorId,
        StartsAt = request.StartsAt,
        Location = request.Location
    };

    db.ScreeningSchedules.Add(schedule);
    await db.SaveChangesAsync();

    return Results.Created($"/api/v1/schedules/{schedule.Id}", schedule);
});

// Get (all)
schedules.MapGet("", async (AppDbContext db) =>
{
    var list = await db.ScreeningSchedules
        .AsNoTracking()
        .Include(s => s.Movie)
        .Include(s => s.Actor)
        .OrderBy(s => s.Id)
        .ToListAsync();

    return Results.Ok(list);
});

// Update
schedules.MapPut("/{id:int}", async (int id, ScheduleUpdateRequest request, AppDbContext db) =>
{
    if (request.StartsAt == default)
        return Results.BadRequest("StartsAt is required");

    var schedule = await db.ScreeningSchedules.FirstOrDefaultAsync(s => s.Id == id);
    if (schedule is null)
        return Results.NotFound();

    var movieExists = await db.Movies.AnyAsync(m => m.Id == request.MovieId);
    if (!movieExists)
        return Results.BadRequest($"MovieId {request.MovieId} does not exist");

    var actorExists = await db.Actors.AnyAsync(a => a.Id == request.ActorId);
    if (!actorExists)
        return Results.BadRequest($"ActorId {request.ActorId} does not exist");

    schedule.MovieId = request.MovieId;
    schedule.ActorId = request.ActorId;
    schedule.StartsAt = request.StartsAt;
    schedule.Location = request.Location;

    await db.SaveChangesAsync();

    return Results.Ok(schedule);
});

// Delete
schedules.MapDelete("/{id:int}", async (int id, AppDbContext db) =>
{
    var schedule = await db.ScreeningSchedules.FirstOrDefaultAsync(s => s.Id == id);
    if (schedule is null)
        return Results.NotFound();

    db.ScreeningSchedules.Remove(schedule);
    await db.SaveChangesAsync();

    return Results.NoContent();
});

app.Run();
