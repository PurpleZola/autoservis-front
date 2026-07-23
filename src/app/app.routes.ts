import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./admin/admin.component').then(m => m.AdminComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./admin/admin-home/admin-home.component').then(m => m.AdminHomeComponent)
      },
      {
        path: 'klijenti',
        loadComponent: () => import('./admin/klijenti/klijenti.component').then(m => m.KlijentiComponent)
      },
      {
        path: 'korisnici',
        loadComponent: () => import('./admin/korisnici/korisnici.component').then(m => m.KorisniciComponent)
      },
      {
        path: 'vozila',
        loadComponent: () => import('./admin/vozila/vozila.component').then(m => m.VozilaComponent)
      }
    ]
  },
  {
    path: 'user',
    loadComponent: () => import('./user/user.component').then(m => m.UserComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];