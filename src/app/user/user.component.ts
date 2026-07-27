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
  route: string;
}

@Component({
  selector: 'app-user',
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
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
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
    { icon: 'directions_car', label: 'Vozila', route: 'vozila' },
    { icon: 'assignment', label: 'Servisni nalozi', route: 'servisni-nalozi' },
    { icon: 'receipt_long', label: 'Računi', route: 'racuni' }
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
