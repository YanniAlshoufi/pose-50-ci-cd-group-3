import { NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import type { Movie, MovieCreateRequest, MovieUpdateRequest } from '../../models/movie.model';
import { MoviesService } from '../../services/movies.service';

@Component({
  selector: 'app-movie-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1>{{ isEdit() ? 'Movie bearbeiten' : 'Neuer Movie' }}</h1>
          <p class="muted">{{ isEdit() ? 'PUT /api/v1/movies/{id}' : 'POST /api/v1/movies' }}</p>
        </div>
        <a class="btn" routerLink="/movies">Zurück</a>
      </header>

      <div *ngIf="error()" class="alert error">{{ error() }}</div>

      <form class="form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <label class="field">
          <span>Titel</span>
          <input class="input" formControlName="title" placeholder="z.B. Inception" />
          <small class="muted" *ngIf="form.controls.title.touched && form.controls.title.invalid">
            Titel ist erforderlich (nicht leer).
          </small>
        </label>

        <label class="field">
          <span>Beschreibung</span>
          <textarea class="input" rows="4" formControlName="description" placeholder="optional"></textarea>
        </label>

        <div class="grid-2">
          <label class="field">
            <span>Dauer in Minuten</span>
            <input class="input" formControlName="durationMinutes" type="number" min="0" placeholder="120" />
            <small class="muted" *ngIf="form.controls.durationMinutes.touched && form.controls.durationMinutes.invalid">
              Dauer ist erforderlich und muss ≥ 0 sein.
            </small>
          </label>

          <label class="field">
            <span>Release Date (YYYY-MM-DD)</span>
            <input class="input" formControlName="releaseDate" type="date" />
          </label>
        </div>

        <div class="actions-row">
          <button class="btn primary" type="submit" [disabled]="saving() || form.invalid">
            {{ saving() ? 'Speichere…' : 'Speichern' }}
          </button>
          <a class="btn" routerLink="/movies">Abbrechen</a>
        </div>
      </form>
    </section>
  `
})
export class MovieFormComponent {
  protected readonly isEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly id: number | null;

  protected readonly form = new FormGroup({
    title: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(1)] }),
    description: new FormControl<string>(''),
    durationMinutes: new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0)] }),
    releaseDate: new FormControl<string>('')
  });

  constructor(
    private readonly moviesService: MoviesService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;
    this.isEdit.set(this.id !== null && !Number.isNaN(this.id));

    const stateMovie = this.router.getCurrentNavigation()?.extras.state?.['movie'] as Movie | undefined;
    if (this.isEdit() && stateMovie) {
      this.form.patchValue({
        title: stateMovie.title,
        description: stateMovie.description ?? '',
        durationMinutes: stateMovie.durationMinutes,
        releaseDate: stateMovie.releaseDate ?? ''
      });
    }
  }

  onSubmit(): void {
    this.error.set(null);
    if (this.form.invalid) return;

    const duration = this.form.controls.durationMinutes.value;
    if (duration === null) return;

    const releaseDate = this.form.controls.releaseDate.value?.trim();

    const payload: MovieCreateRequest | MovieUpdateRequest = {
      title: this.form.controls.title.value.trim(),
      description: this.form.controls.description.value?.trim() ? this.form.controls.description.value.trim() : null,
      durationMinutes: duration,
      releaseDate: releaseDate ? releaseDate : null
    };

    this.saving.set(true);

    const request$ = this.isEdit() && this.id !== null
      ? this.moviesService.update(this.id, payload)
      : this.moviesService.create(payload);

    request$.subscribe({
      next: () => this.router.navigateByUrl('/movies'),
      error: err => {
        this.saving.set(false);
        this.error.set('Speichern fehlgeschlagen.');
        console.error(err);
      }
    });
  }
}
