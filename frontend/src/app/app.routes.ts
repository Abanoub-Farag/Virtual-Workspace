import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
    title: 'Sign Up – Pcenter',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent,
      ),
    title: 'Log In – Pcenter',
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./features/rooms/rooms-view.component').then(
        (m) => m.RoomsViewComponent,
      ),
    title: 'Rooms – Pcenter',
  },
  {
    path: '',
    redirectTo: '/register',
    pathMatch: 'full',
  },
];


