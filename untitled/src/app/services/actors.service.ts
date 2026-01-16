import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../shared/api-base-url.token';
import type { Actor, ActorCreateRequest, ActorUpdateRequest } from '../models/actor.model';

@Injectable({ providedIn: 'root' })
export class ActorsService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string
  ) {
    this.baseUrl = `${apiBaseUrl}/actors`;
  }

  getAll(): Observable<Actor[]> {
    return this.http.get<Actor[]>(this.baseUrl);
  }

  create(payload: ActorCreateRequest): Observable<Actor> {
    return this.http.post<Actor>(this.baseUrl, payload);
  }

  update(id: number, payload: ActorUpdateRequest): Observable<Actor> {
    return this.http.put<Actor>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
