import { DatePipe, NgFor, NgIf } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import type { ScheduleWithDetails } from '../../models/schedule.model';
import { SchedulesService } from '../../services/schedules.service';

@Component({
  selector: 'app-schedules-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, DatePipe],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1>Schedules</h1>
          <p class="muted">
            CRUD über <code>/api/v1/schedules</code> (GET inkl. Movie + Actor)
          </p>
        </div>
        <a class="btn primary" routerLink="/schedules/new">+ Schedule</a>
      </header>

      <div class="toolbar">
        <input class="input" placeholder="Suchen…" [value]="query()" (input)="query.set(($any($event.target).value || '').toString())" />
        <button class="btn" (click)="reload()">Reload</button>
      </div>

      <div *ngIf="error()" class="alert error">{{ error() }}</div>
      <div *ngIf="loading()" class="muted">Lade…</div>

      <div *ngIf="!loading() && filtered().length === 0" class="empty">
        <h3>Keine Schedules</h3>
        <p class="muted">Lege eine Zuordnung Movie ↔ Actor an.</p>
        <a class="btn primary" routerLink="/schedules/new">+ Schedule</a>
      </div>

      <div class="table" *ngIf="filtered().length > 0">
        <div class="row head">
          <div>Movie</div>
          <div>Actor</div>
          <div>Starts At</div>
          <div>Location</div>
          <div class="actions">Aktionen</div>
        </div>

        <div class="row" *ngFor="let s of filtered()">
          <div class="strong">{{ movieLabel(s) }}</div>
          <div>{{ actorLabel(s) }}</div>
          <div>{{ s.startsAt | date:'medium' }}</div>
          <div>{{ s.location ?? '-' }}</div>
          <div class="actions">
            <a class="btn" [routerLink]="['/schedules', s.id]" [state]="{ schedule: s }">Edit</a>
            <button class="btn danger" (click)="onDelete(s)">Delete</button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class SchedulesListComponent {
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly schedules = signal<ScheduleWithDetails[]>([]);
  protected readonly query = signal('');

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.schedules();
    return this.schedules().filter(s => {
      const movie = this.movieLabel(s).toLowerCase();
      const actor = this.actorLabel(s).toLowerCase();
      return (
        movie.includes(q) ||
        actor.includes(q) ||
        (s.location ?? '').toLowerCase().includes(q) ||
        (s.startsAt ?? '').toLowerCase().includes(q)
      );
    });
  });

  constructor(private readonly schedulesService: SchedulesService) {
    this.reload();
  }

  reload(): void {
    this.error.set(null);
    this.loading.set(true);

    this.schedulesService
      .getAll()
      .pipe(
        tap(s => this.schedules.set(s ?? [])),
        catchError(err => {
          this.error.set('Konnte Schedules nicht laden.');
          console.error(err);
          return of([] as ScheduleWithDetails[]);
        }),
        tap(() => this.loading.set(false))
      )
      .subscribe();
  }

  movieLabel(s: ScheduleWithDetails): string {
    return s.movie?.title ?? `#${s.movieId}`;
  }

  actorLabel(s: ScheduleWithDetails): string {
    if (s.actor) return `${s.actor.firstName} ${s.actor.lastName}`.trim();
    return `#${s.actorId}`;
  }

  onDelete(schedule: ScheduleWithDetails): void {
    const ok = confirm('Schedule wirklich löschen?');
    if (!ok) return;

    this.schedulesService.delete(schedule.id).subscribe({
      next: () => this.reload(),
      error: err => {
        this.error.set('Löschen fehlgeschlagen.');
        console.error(err);
      }
    });
  }
}
