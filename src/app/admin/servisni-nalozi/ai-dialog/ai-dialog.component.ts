import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AiService } from '../../../services/ai.service';
import { PredvidjanjeKvara, PreporukaDijelova } from '../../../models/ai.model';

export interface AiDialogData {
  voziloId: number;
}

@Component({
  selector: 'app-ai-dialog',
  standalone: true,
  imports: [MatDialogModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './ai-dialog.component.html',
  styleUrl: './ai-dialog.component.scss'
})
export class AiDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<AiDialogComponent>);
  private readonly data = inject<AiDialogData>(MAT_DIALOG_DATA);
  private readonly aiService = inject(AiService);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);
  readonly predvidjanje = signal<PredvidjanjeKvara | null>(null);
  readonly preporukaDijelova = signal<PreporukaDijelova | null>(null);

  ngOnInit(): void {
    this.loadAnaliza();
  }

  loadAnaliza(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    forkJoin({
      predvidjanje: this.aiService.predvidiKvar(this.data.voziloId).pipe(catchError(() => of(null))),
      dijelovi: this.aiService.preporuciDijelove(this.data.voziloId).pipe(catchError(() => of(null)))
    }).subscribe(({ predvidjanje, dijelovi }) => {
      this.predvidjanje.set(predvidjanje);
      this.preporukaDijelova.set(dijelovi);
      this.loading.set(false);

      if (!predvidjanje && !dijelovi) {
        this.errorMessage.set('Greška prilikom učitavanja AI analize. Provjerite da li je AI servis pokrenut.');
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
