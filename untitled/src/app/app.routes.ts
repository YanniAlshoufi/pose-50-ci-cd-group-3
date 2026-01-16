import { Routes } from '@angular/router';

import { HomeComponent } from './features/home/home.component';
import { MoviesListComponent } from './features/movies/movies-list.component';
import { MovieFormComponent } from './features/movies/movie-form.component';
import { ActorsListComponent } from './features/actors/actors-list.component';
import { ActorFormComponent } from './features/actors/actor-form.component';
import { SchedulesListComponent } from './features/schedules/schedules-list.component';
import { ScheduleFormComponent } from './features/schedules/schedule-form.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },

  { path: 'movies', component: MoviesListComponent },
  { path: 'movies/new', component: MovieFormComponent },
  { path: 'movies/:id', component: MovieFormComponent },

  { path: 'actors', component: ActorsListComponent },
  { path: 'actors/new', component: ActorFormComponent },
  { path: 'actors/:id', component: ActorFormComponent },

  { path: 'schedules', component: SchedulesListComponent },
  { path: 'schedules/new', component: ScheduleFormComponent },
  { path: 'schedules/:id', component: ScheduleFormComponent },

  { path: '**', redirectTo: '' }
];
