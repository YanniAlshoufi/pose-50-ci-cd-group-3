import type { Actor } from './actor.model';
import type { Movie } from './movie.model';

export interface Schedule {
  id: number;
  movieId: number;
  actorId: number;
  /** ISO DateTime, e.g. 2026-01-16T19:30:00 */
  startsAt: string;
  location: string | null;
}

export interface ScheduleCreateRequest {
  movieId: number;
  actorId: number;
  /** ISO DateTime, e.g. 2026-01-16T19:30:00 */
  startsAt: string;
  location: string | null;
}

export type ScheduleUpdateRequest = ScheduleCreateRequest;

/** GET /schedules includes Movie + Actor (Include) */
export interface ScheduleWithDetails extends Schedule {
  movie?: Movie | null;
  actor?: Actor | null;
}
