import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../services/auth.service';
import { CurrentKlijentService } from '../services/current-klijent.service';

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
export class AdminComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly currentKlijentService = inject(CurrentKlijentService);
  private readonly router = inject(Router);

  private readonly role = this.authService.getRole() ?? '';
  private readonly fullName = signal(this.authService.getEmail() ?? '');

  readonly displayLabel = computed(() => {
    const prefix = this.role === 'ADMIN' ? 'Administrator' : 'Korisnik';
    return `${prefix}: ${this.fullName()}`;
  });

  readonly navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Pregled', route: 'dashboard' },
    { icon: 'people', label: 'Korisnici', route: 'korisnici' },
    { icon: 'groups', label: 'Klijenti', route: 'klijenti' },
    { icon: 'directions_car', label: 'Vozila', route: 'vozila' },
    { icon: 'build', label: 'Serviseri', route: 'serviseri' },
    { icon: 'assignment', label: 'Servisni nalozi', route: 'servisni-nalozi' },
    { icon: 'report_problem', label: 'Kvarovi', route: 'kvarovi' },
    { icon: 'home_repair_service', label: 'Usluge', route: 'usluge' },
    { icon: 'settings', label: 'Dijelovi', route: 'dijelovi' },
    { icon: 'receipt_long', label: 'Računi', route: 'racuni' },
    { icon: 'event', label: 'Termini', route: 'termini' }
  ];

  ngOnInit(): void {
    this.currentKlijentService.getCurrentKlijent().subscribe({
      next: (klijent) => {
        if (klijent) {
          this.fullName.set(`${klijent.ime} ${klijent.prezime}`);
        }
      },
      error: () => {}
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
