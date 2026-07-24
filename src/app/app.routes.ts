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
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () => import('./admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
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
      },
      {
        path: 'serviseri',
        loadComponent: () => import('./admin/serviseri/serviseri.component').then(m => m.ServiseriComponent)
      },
      {
        path: 'servisni-nalozi',
        loadComponent: () =>
          import('./admin/servisni-nalozi/servisni-nalozi.component').then(m => m.ServisniNaloziComponent)
      },
      {
        path: 'kvarovi',
        loadComponent: () => import('./admin/kvarovi/kvarovi.component').then(m => m.KvaroviComponent)
      },
      {
        path: 'usluge',
        loadComponent: () => import('./admin/usluge/usluge.component').then(m => m.UslugeComponent)
      },
      {
        path: 'dijelovi',
        loadComponent: () => import('./admin/dijelovi/dijelovi.component').then(m => m.DijeloviComponent)
      },
      {
        path: 'racuni',
        loadComponent: () => import('./admin/racuni/racuni.component').then(m => m.RacuniComponent)
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