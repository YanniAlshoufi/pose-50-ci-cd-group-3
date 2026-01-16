import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="page">
      <h1>Movie Scheduler</h1>
      <p class="muted">
        Verwalte Movies, Actors und Schedules über deine REST WebAPI.
      </p>

      <div class="cards">
        <a class="card" routerLink="/movies">
          <h3>Movies</h3>
          <p>Filme anlegen, ändern und löschen.</p>
        </a>
        <a class="card" routerLink="/actors">
          <h3>Actors</h3>
          <p>Schauspieler verwalten.</p>
        </a>
        <a class="card" routerLink="/schedules">
          <h3>Schedules</h3>
          <p>Zuordnung Movie ↔ Actor inkl. Zeiten.</p>
        </a>
      </div>
    </section>
  `
})
export class HomeComponent {}
