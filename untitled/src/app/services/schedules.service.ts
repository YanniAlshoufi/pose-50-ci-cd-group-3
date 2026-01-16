import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../shared/api-base-url.token';
import type { ScheduleCreateRequest, ScheduleUpdateRequest, ScheduleWithDetails } from '../models/schedule.model';

@Injectable({ providedIn: 'root' })
export class SchedulesService {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    @Inject(API_BASE_URL) apiBaseUrl: string
  ) {
    this.baseUrl = `${apiBaseUrl}/schedules`;
  }

  getAll(): Observable<ScheduleWithDetails[]> {
    return this.http.get<ScheduleWithDetails[]>(this.baseUrl);
  }

  create(payload: ScheduleCreateRequest): Observable<ScheduleWithDetails> {
    return this.http.post<ScheduleWithDetails>(this.baseUrl, payload);
  }

  update(id: number, payload: ScheduleUpdateRequest): Observable<ScheduleWithDetails> {
    return this.http.put<ScheduleWithDetails>(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
