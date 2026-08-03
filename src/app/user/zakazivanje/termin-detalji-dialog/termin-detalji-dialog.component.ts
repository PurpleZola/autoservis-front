import { Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

import { Termin } from '../../../models/termin.model';
import { Vozilo } from '../../../models/vozilo.model';

export interface TerminDetaljiDialogData {
  termin: Termin;
  vozilo: Vozilo | null;
}

@Component({
  selector: 'app-termin-detalji-dialog',
  standalone: true,
  imports: [NgClass, MatDialogModule, MatButtonModule, MatChipsModule],
  templateUrl: './termin-detalji-dialog.component.html',
  styleUrl: './termin-detalji-dialog.component.scss'
})
export class TerminDetaljiDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<TerminDetaljiDialogComponent, 'cancel'>);
  readonly data = inject<TerminDetaljiDialogData>(MAT_DIALOG_DATA);

  onOtkazi(): void {
    const potvrda = confirm('Da li ste sigurni da želite otkazati ovaj termin?');
    if (!potvrda) return;

    this.dialogRef.close('cancel');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
