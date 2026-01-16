export interface Movie {
  id: number;
  title: string;
  description: string | null;
  durationMinutes: number;
  /** Format: YYYY-MM-DD */
  releaseDate: string | null;
}

export interface MovieCreateRequest {
  title: string;
  description: string | null;
  durationMinutes: number;
  /** Format: YYYY-MM-DD */
  releaseDate: string | null;
}

export type MovieUpdateRequest = MovieCreateRequest;
