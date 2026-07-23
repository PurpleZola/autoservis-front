import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../services/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route?: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Pregled', route: '' },
    { icon: 'people', label: 'Korisnici', route: 'korisnici' },
    { icon: 'groups', label: 'Klijenti', route: 'klijenti' },
    { icon: 'directions_car', label: 'Vozila', route: 'vozila' },
    { icon: 'build', label: 'Serviseri', route: 'serviseri' },
    { icon: 'assignment', label: 'Servisni nalozi', route: 'servisni-nalozi' },
    { icon: 'report_problem', label: 'Kvarovi', route: 'kvarovi' },
    { icon: 'home_repair_service', label: 'Usluge', route: 'usluge' },
    { icon: 'settings', label: 'Dijelovi', route: 'dijelovi' },
    { icon: 'receipt_long', label: 'Računi', route: 'racuni' }
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
