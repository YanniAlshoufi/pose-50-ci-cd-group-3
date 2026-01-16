using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;

namespace WebApplication1.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<Actor> Actors => Set<Actor>();
    public DbSet<ScreeningSchedule> ScreeningSchedules => Set<ScreeningSchedule>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Movie>()
            .HasIndex(m => m.Title);

        modelBuilder.Entity<Actor>()
            .HasIndex(a => new { a.FirstName, a.LastName });

        modelBuilder.Entity<ScreeningSchedule>()
            .HasOne(s => s.Movie)
            .WithMany(m => m.ScreeningSchedules)
            .HasForeignKey(s => s.MovieId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ScreeningSchedule>()
            .HasOne(s => s.Actor)
            .WithMany(a => a.ScreeningSchedules)
            .HasForeignKey(s => s.ActorId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<ScreeningSchedule>()
            .HasIndex(s => new { s.MovieId, s.StartsAt });
    }
}

