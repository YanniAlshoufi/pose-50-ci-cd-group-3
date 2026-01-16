import { NgFor, NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, combineLatest, of, tap } from 'rxjs';

import type { Actor } from '../../models/actor.model';
import type { Movie } from '../../models/movie.model';
import type { ScheduleCreateRequest, ScheduleWithDetails } from '../../models/schedule.model';
import { ActorsService } from '../../services/actors.service';
import { MoviesService } from '../../services/movies.service';
import { SchedulesService } from '../../services/schedules.service';

@Component({
  selector: 'app-schedule-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf, NgFor],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1>{{ isEdit() ? 'Schedule bearbeiten' : 'Neuer Schedule' }}</h1>
          <p class="muted">{{ isEdit() ? 'PUT /api/v1/schedules/{id}' : 'POST /api/v1/schedules' }}</p>
        </div>
        <a class="btn" routerLink="/schedules">Zurück</a>
      </header>

      <div *ngIf="error()" class="alert error">{{ error() }}</div>

      <div *ngIf="loadingLookups()" class="muted">Lade Movies/Actors…</div>

      <form class="form" [formGroup]="form" (ngSubmit)="onSubmit()" *ngIf="!loadingLookups()">
        <div class="grid-2">
          <label class="field">
            <span>Movie</span>
            <select class="input" formControlName="movieId">
              <option [ngValue]="null">Bitte wählen…</option>
              <option *ngFor="let m of movies()" [ngValue]="m.id">{{ m.title }}</option>
            </select>
          </label>

          <label class="field">
            <span>Actor</span>
            <select class="input" formControlName="actorId">
              <option [ngValue]="null">Bitte wählen…</option>
              <option *ngFor="let a of actors()" [ngValue]="a.id">{{ a.firstName }} {{ a.lastName }}</option>
            </select>
          </label>
        </div>

        <div class="grid-2">
          <label class="field">
            <span>Starts At (YYYY-MM-DDTHH:mm:ss)</span>
            <input class="input" type="datetime-local" step="1" formControlName="startsAt" />
            <small class="muted" *ngIf="form.controls.startsAt.touched && form.controls.startsAt.invalid">
              Startzeit ist erforderlich.
            </small>
          </label>

          <label class="field">
            <span>Location (optional)</span>
            <input class="input" formControlName="location" placeholder="z.B. Kino 1" />
          </label>
        </div>

        <small class="muted">
          Gesendet wird ein ISO-String ohne Zeitzone: <code>YYYY-MM-DDTHH:mm:ss</code>
        </small>

        <div class="actions-row">
          <button class="btn primary" type="submit" [disabled]="saving() || form.invalid">
            {{ saving() ? 'Speichere…' : 'Speichern' }}
          </button>
          <a class="btn" routerLink="/schedules">Abbrechen</a>
        </div>
      </form>
    </section>
  `
})
export class ScheduleFormComponent {
  protected readonly isEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly loadingLookups = signal(false);
  protected readonly movies = signal<Movie[]>([]);
  protected readonly actors = signal<Actor[]>([]);

  private readonly id: number | null;

  protected readonly form = new FormGroup({
    movieId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    actorId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    startsAt: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    location: new FormControl<string>('')
  });

  constructor(
    private readonly schedulesService: SchedulesService,
    private readonly moviesService: MoviesService,
    private readonly actorsService: ActorsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;
    this.isEdit.set(this.id !== null && !Number.isNaN(this.id));

    this.loadLookups();
  }

  private loadLookups(): void {
    this.loadingLookups.set(true);
    this.error.set(null);

    combineLatest([
      this.moviesService.getAll().pipe(catchError(err => {
        console.error(err);
        return of([] as Movie[]);
      })),
      this.actorsService.getAll().pipe(catchError(err => {
        console.error(err);
        return of([] as Actor[]);
      }))
    ])
      .pipe(
        tap(([movies, actors]) => {
          this.movies.set(movies ?? []);
          this.actors.set(actors ?? []);
        }),
        tap(() => this.loadingLookups.set(false))
      )
      .subscribe();

    const stateSchedule = this.router.getCurrentNavigation()?.extras.state?.['schedule'] as ScheduleWithDetails | undefined;
    if (this.isEdit() && stateSchedule) {
      this.form.patchValue({
        movieId: stateSchedule.movieId ?? null,
        actorId: stateSchedule.actorId ?? null,
        startsAt: this.toDatetimeLocal(stateSchedule.startsAt),
        location: stateSchedule.location ?? ''
      });
    }
  }

  onSubmit(): void {
    this.error.set(null);
    if (this.form.invalid) return;

    const movieId = this.form.controls.movieId.value;
    const actorId = this.form.controls.actorId.value;
    if (movieId === null || actorId === null) return;

    const startsAtLocal = this.form.controls.startsAt.value;

    const payload: ScheduleCreateRequest = {
      movieId,
      actorId,
      startsAt: this.fromDatetimeLocalToApiIso(startsAtLocal),
      location: this.form.controls.location.value?.trim() ? this.form.controls.location.value.trim() : null
    };

    this.saving.set(true);

    const request$ = this.isEdit() && this.id !== null
      ? this.schedulesService.update(this.id, payload)
      : this.schedulesService.create(payload);

    request$.subscribe({
      next: () => this.router.navigateByUrl('/schedules'),
      error: err => {
        this.saving.set(false);
        this.error.set('Speichern fehlgeschlagen.');
        console.error(err);
      }
    });
  }

  /** Converts 'YYYY-MM-DDTHH:mm(:ss)' from input to API format 'YYYY-MM-DDTHH:mm:ss' */
  private fromDatetimeLocalToApiIso(value: string): string {
    // ensure seconds
    return value.length === 16 ? `${value}:00` : value;
  }

  private toDatetimeLocal(iso: string): string {
    // iso may contain timezone; keep local parts
    const d = new Date(iso);
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }
}
