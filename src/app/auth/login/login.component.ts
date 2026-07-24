import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../services/auth.service';
import { KlijentiService } from '../../services/klijenti.service';

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const LOZINKA_PATTERN = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
const IME_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿČčĆćŽžŠšĐđ]{2,}(?: [A-Za-zÀ-ÖØ-öø-ÿČčĆćŽžŠšĐđ]+)*$/;

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const lozinka = control.get('lozinka')?.value;
  const potvrdaLozinke = control.get('potvrdaLozinke')?.value;
  return lozinka === potvrdaLozinke ? null : { passwordMismatch: true };
}

function telefonFormatValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }

  const allowedChars = /^[0-9+\-\s]+$/;
  if (!allowedChars.test(value)) {
    return { telefonFormat: true };
  }

  const digitCount = (value.match(/\d/g) ?? []).length;
  return digitCount >= 6 ? null : { telefonFormat: true };
}

const ADRESA_PATTERN = /^[A-Za-zÀ-ÖØ-öø-ÿČčĆćŽžŠšĐđ0-9 .,\-/#]+$/;

function adresaFormatValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }

  return ADRESA_PATTERN.test(value) ? null : { adresaFormat: true };
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly klijentiService = inject(KlijentiService);
  private readonly router = inject(Router);

  readonly hidePassword = signal(true);
  readonly hideRegisterPassword = signal(true);
  readonly hideConfirmPassword = signal(true);
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly mode = signal<'login' | 'register'>('login');

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    lozinka: ['', [Validators.required, Validators.minLength(4)]]
  });

  readonly registerForm = this.fb.group(
    {
      email: ['', [Validators.required, Validators.pattern(EMAIL_PATTERN)]],
      lozinka: ['', [Validators.required, Validators.pattern(LOZINKA_PATTERN)]],
      potvrdaLozinke: ['', [Validators.required]],
      ime: ['', [Validators.required, Validators.pattern(IME_PATTERN)]],
      prezime: ['', [Validators.required, Validators.pattern(IME_PATTERN)]],
      telefon: ['', [telefonFormatValidator]],
      adresa: ['', [adresaFormatValidator]]
    },
    { validators: passwordsMatchValidator }
  );

  togglePasswordVisibility(event: Event): void {
    event.preventDefault();
    this.hidePassword.update(value => !value);
  }

  toggleRegisterPasswordVisibility(event: Event): void {
    event.preventDefault();
    this.hideRegisterPassword.update(value => !value);
  }

  toggleConfirmPasswordVisibility(event: Event): void {
    event.preventDefault();
    this.hideConfirmPassword.update(value => !value);
  }

  switchMode(mode: 'login' | 'register', event: Event): void {
    event.preventDefault();
    this.mode.set(mode);
    this.errorMessage.set(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, lozinka } = this.form.getRawValue();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.login(email!, lozinka!).subscribe({
      next: (response) => {
        this.authService.saveToken(response.token);
        this.authService.saveRole(response.rola);
        this.loading.set(false);

        if (response.rola === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/user']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.greska ?? 'Prijava nije uspjela. Pokušajte ponovo.');
      }
    });
  }

  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { email, lozinka, ime, prezime, telefon, adresa } = this.registerForm.getRawValue();
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.register(email!, lozinka!, 'USER').subscribe({
      next: (response) => {
        // Token must be saved before the klijenti call so the auth interceptor
        // attaches the new user's JWT instead of sending the request unauthenticated.
        this.authService.saveToken(response.token);
        this.authService.saveRole(response.rola);

        this.klijentiService
          .create({
            ime: ime!,
            prezime: prezime!,
            telefon: telefon ?? '',
            adresa: adresa ?? '',
            korisnikId: response.id!
          })
          .subscribe({
            next: () => {
              this.loading.set(false);
              this.router.navigate(['/user']);
            },
            error: (err) => {
              console.error('Kreiranje klijenta nije uspjelo:', err.status, err.error ?? err.message);
              this.loading.set(false);
              this.errorMessage.set(err?.error?.greska ?? 'Nalog je kreiran, ali podaci klijenta nisu sačuvani.');
            }
          });
      },
      error: (err) => {
        console.error('Registracija nije uspjela:', err.status, err.error ?? err.message);
        this.loading.set(false);
        this.errorMessage.set(err?.error?.greska ?? 'Registracija nije uspjela. Pokušajte ponovo.');
      }
    });
  }
}
