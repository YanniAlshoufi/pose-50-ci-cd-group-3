export interface Actor {
  id: number;
  firstName: string;
  lastName: string;
  /** Format: YYYY-MM-DD */
  birthDate: string | null;
}

export interface ActorCreateRequest {
  firstName: string;
  lastName: string;
  /** Format: YYYY-MM-DD */
  birthDate: string | null;
}

export type ActorUpdateRequest = ActorCreateRequest;
