import { NgFor, NgIf } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import type { Movie } from '../../models/movie.model';
import { MoviesService } from '../../services/movies.service';

@Component({
  selector: 'app-movies-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1>Movies</h1>
          <p class="muted">CRUD über <code>/api/v1/movies</code></p>
        </div>
        <a class="btn primary" routerLink="/movies/new">+ Movie</a>
      </header>

      <div class="toolbar">
        <input class="input" placeholder="Suchen…" [value]="query()" (input)="query.set(($any($event.target).value || '').toString())" />
        <button class="btn" (click)="reload()">Reload</button>
      </div>

      <div *ngIf="error()" class="alert error">{{ error() }}</div>
      <div *ngIf="loading()" class="muted">Lade…</div>

      <div *ngIf="!loading() && (filtered().length === 0)" class="empty">
        <h3>Keine Movies</h3>
        <p class="muted">Lege deinen ersten Film an.</p>
        <a class="btn primary" routerLink="/movies/new">+ Movie</a>
      </div>

      <div class="table" *ngIf="filtered().length > 0">
        <div class="row head">
          <div>Titel</div>
          <div>Dauer (min)</div>
          <div>Release</div>
          <div class="actions">Aktionen</div>
        </div>

        <div class="row" *ngFor="let m of filtered()">
          <div class="strong">{{ m.title }}</div>
          <div>{{ m.durationMinutes }}</div>
          <div>{{ m.releaseDate ?? '-' }}</div>
          <div class="actions">
            <a class="btn" [routerLink]="['/movies', m.id]" [state]="{ movie: m }">Edit</a>
            <button class="btn danger" (click)="onDelete(m)">Delete</button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class MoviesListComponent {
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly movies = signal<Movie[]>([]);
  protected readonly query = signal('');

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.movies();
    return this.movies().filter(m =>
      [m.title, m.description ?? '', `${m.durationMinutes}`, m.releaseDate ?? ''].some(v => v.toLowerCase().includes(q))
    );
  });

  constructor(private readonly moviesService: MoviesService) {
    this.reload();
  }

  reload(): void {
    this.error.set(null);
    this.loading.set(true);

    this.moviesService
      .getAll()
      .pipe(
        tap(m => this.movies.set(m ?? [])),
        catchError(err => {
          this.error.set('Konnte Movies nicht laden.');
          console.error(err);
          return of([] as Movie[]);
        }),
        tap(() => this.loading.set(false))
      )
      .subscribe();
  }

  onDelete(movie: Movie): void {
    const ok = confirm(`Movie "${movie.title}" wirklich löschen?`);
    if (!ok) return;

    this.moviesService.delete(movie.id).subscribe({
      next: () => this.reload(),
      error: err => {
        this.error.set('Löschen fehlgeschlagen.');
        console.error(err);
      }
    });
  }
}
