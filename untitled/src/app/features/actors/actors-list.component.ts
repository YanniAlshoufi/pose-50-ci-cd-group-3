import { NgFor, NgIf } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, of, tap } from 'rxjs';

import type { Actor } from '../../models/actor.model';
import { ActorsService } from '../../services/actors.service';

@Component({
  selector: 'app-actors-list',
  standalone: true,
  imports: [NgIf, NgFor, RouterLink],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1>Actors</h1>
          <p class="muted">CRUD über <code>/api/v1/actors</code></p>
        </div>
        <a class="btn primary" routerLink="/actors/new">+ Actor</a>
      </header>

      <div class="toolbar">
        <input class="input" placeholder="Suchen…" [value]="query()" (input)="query.set(($any($event.target).value || '').toString())" />
        <button class="btn" (click)="reload()">Reload</button>
      </div>

      <div *ngIf="error()" class="alert error">{{ error() }}</div>
      <div *ngIf="loading()" class="muted">Lade…</div>

      <div *ngIf="!loading() && (filtered().length === 0)" class="empty">
        <h3>Keine Actors</h3>
        <p class="muted">Lege deinen ersten Actor an.</p>
        <a class="btn primary" routerLink="/actors/new">+ Actor</a>
      </div>

      <div class="table" *ngIf="filtered().length > 0">
        <div class="row head">
          <div>Vorname</div>
          <div>Nachname</div>
          <div>Geburtstag</div>
          <div class="actions">Aktionen</div>
        </div>

        <div class="row" *ngFor="let a of filtered()">
          <div class="strong">{{ a.firstName }}</div>
          <div>{{ a.lastName }}</div>
          <div>{{ a.birthDate ?? '-' }}</div>
          <div class="actions">
            <a class="btn" [routerLink]="['/actors', a.id]" [state]="{ actor: a }">Edit</a>
            <button class="btn danger" (click)="onDelete(a)">Delete</button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ActorsListComponent {
  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly actors = signal<Actor[]>([]);
  protected readonly query = signal('');

  protected readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.actors();
    return this.actors().filter(a =>
      [a.firstName, a.lastName, a.birthDate ?? ''].some(v => v.toLowerCase().includes(q))
    );
  });

  constructor(private readonly actorsService: ActorsService) {
    this.reload();
  }

  reload(): void {
    this.error.set(null);
    this.loading.set(true);

    this.actorsService
      .getAll()
      .pipe(
        tap(a => this.actors.set(a ?? [])),
        catchError(err => {
          this.error.set('Konnte Actors nicht laden.');
          console.error(err);
          return of([] as Actor[]);
        }),
        tap(() => this.loading.set(false))
      )
      .subscribe();
  }

  onDelete(actor: Actor): void {
    const ok = confirm(`Actor "${actor.firstName} ${actor.lastName}" wirklich löschen?`);
    if (!ok) return;

    this.actorsService.delete(actor.id).subscribe({
      next: () => this.reload(),
      error: err => {
        this.error.set('Löschen fehlgeschlagen.');
        console.error(err);
      }
    });
  }
}
