import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

import { Termin } from '../../../models/termin.model';

export interface RazlogOdbijanjaDialogData {
  termin: Termin;
}

@Component({
  selector: 'app-razlog-odbijanja-dialog',
  standalone: true,
  imports: [ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './razlog-odbijanja-dialog.component.html',
  styleUrl: './razlog-odbijanja-dialog.component.scss'
})
export class RazlogOdbijanjaDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<RazlogOdbijanjaDialogComponent, string>);
  readonly data = inject<RazlogOdbijanjaDialogData>(MAT_DIALOG_DATA);

  readonly form = this.fb.group({
    razlogOdbijanja: ['']
  });

  onOdbij(): void {
    this.dialogRef.close(this.form.getRawValue().razlogOdbijanja?.trim() ?? '');
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
