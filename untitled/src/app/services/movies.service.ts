import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../shared/api-base-url.token';
import type { Movie, MovieCreateRequest, MovieUpdateRequest } from '../models/movie.model';

@Injectable({ providedIn: 'root' })
export class MoviesService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string
  ) {
    this.baseUrl = `${apiBaseUrl}/movies`;
  }

  getAll(): Observable<Movie[]> {
    return this.http.get<Movie[]>(this.baseUrl);
  }

  create(payload: MovieCreateRequest): Observable<Movie> {
    return this.http.post<Movie>(this.baseUrl, payload);
  }

  update(id: number, payload: MovieUpdateRequest): Observable<Movie> {
    return this.http.put<Movie>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
