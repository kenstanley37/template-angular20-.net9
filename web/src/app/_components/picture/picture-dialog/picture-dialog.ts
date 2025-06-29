import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-picture-dialog',
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './picture-dialog.html',
  styleUrl: './picture-dialog.scss'
})
export class PictureDialog {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { img: string },
    public dialogRef: MatDialogRef<PictureDialog>
  ) {}
}
