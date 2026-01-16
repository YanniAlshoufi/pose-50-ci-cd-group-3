import { NgIf } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import type { Actor, ActorCreateRequest, ActorUpdateRequest } from '../../models/actor.model';
import { ActorsService } from '../../services/actors.service';

@Component({
  selector: 'app-actor-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, NgIf],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1>{{ isEdit() ? 'Actor bearbeiten' : 'Neuer Actor' }}</h1>
          <p class="muted">{{ isEdit() ? 'PUT /api/v1/actors/{id}' : 'POST /api/v1/actors' }}</p>
        </div>
        <a class="btn" routerLink="/actors">Zurück</a>
      </header>

      <div *ngIf="error()" class="alert error">{{ error() }}</div>

      <form class="form" [formGroup]="form" (ngSubmit)="onSubmit()">
        <div class="grid-2">
          <label class="field">
            <span>Vorname</span>
            <input class="input" formControlName="firstName" />
            <small class="muted" *ngIf="form.controls.firstName.touched && form.controls.firstName.invalid">
              Vorname ist erforderlich (nicht leer).
            </small>
          </label>

          <label class="field">
            <span>Nachname</span>
            <input class="input" formControlName="lastName" />
            <small class="muted" *ngIf="form.controls.lastName.touched && form.controls.lastName.invalid">
              Nachname ist erforderlich (nicht leer).
            </small>
          </label>
        </div>

        <label class="field">
          <span>Birth Date (YYYY-MM-DD)</span>
          <input class="input" type="date" formControlName="birthDate" />
        </label>

        <div class="actions-row">
          <button class="btn primary" type="submit" [disabled]="saving() || form.invalid">
            {{ saving() ? 'Speichere…' : 'Speichern' }}
          </button>
          <a class="btn" routerLink="/actors">Abbrechen</a>
        </div>
      </form>
    </section>
  `
})
export class ActorFormComponent {
  protected readonly isEdit = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  private readonly id: number | null;

  protected readonly form = new FormGroup({
    firstName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(1)] }),
    lastName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(1)] }),
    birthDate: new FormControl<string>('')
  });

  constructor(
    private readonly actorsService: ActorsService,
    private readonly route: ActivatedRoute,
    private readonly router: Router
  ) {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? Number(idParam) : null;
    this.isEdit.set(this.id !== null && !Number.isNaN(this.id));

    const stateActor = this.router.getCurrentNavigation()?.extras.state?.['actor'] as Actor | undefined;
    if (this.isEdit() && stateActor) {
      this.form.patchValue({
        firstName: stateActor.firstName,
        lastName: stateActor.lastName,
        birthDate: stateActor.birthDate ?? ''
      });
    }
  }

  onSubmit(): void {
    this.error.set(null);
    if (this.form.invalid) return;

    const birthDate = this.form.controls.birthDate.value?.trim();

    const payload: ActorCreateRequest | ActorUpdateRequest = {
      firstName: this.form.controls.firstName.value.trim(),
      lastName: this.form.controls.lastName.value.trim(),
      birthDate: birthDate ? birthDate : null
    };

    this.saving.set(true);

    const request$ = this.isEdit() && this.id !== null
      ? this.actorsService.update(this.id, payload)
      : this.actorsService.create(payload);

    request$.subscribe({
      next: () => this.router.navigateByUrl('/actors'),
      error: err => {
        this.saving.set(false);
        this.error.set('Speichern fehlgeschlagen.');
        console.error(err);
      }
    });
  }
}
