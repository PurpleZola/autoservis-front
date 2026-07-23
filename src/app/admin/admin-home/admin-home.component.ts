import { Component } from '@angular/core';

@Component({
  selector: 'app-admin-home',
  standalone: true,
  template: `
    <div class="welcome-panel">
      <h1>Dobrodošli, Administratore</h1>
      <p>Odaberite opciju iz bočnog menija za upravljanje auto servisom.</p>
    </div>
  `,
  styles: [`
    .welcome-panel h1 {
      margin: 0 0 0.5rem;
      font: var(--mat-sys-headline-medium);
    }

    .welcome-panel p {
      margin: 0;
      color: var(--mat-sys-on-surface-variant);
    }
  `]
})
export class AdminHomeComponent {}
