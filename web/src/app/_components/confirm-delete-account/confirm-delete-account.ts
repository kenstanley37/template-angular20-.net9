import { Component } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-delete-account',
  imports: [MatDialogModule],
  templateUrl: './confirm-delete-account.html',
  styleUrl: './confirm-delete-account.scss'
})
export class ConfirmDeleteAccount {
  constructor(public dialogRef: MatDialogRef<ConfirmDeleteAccount>) { }


  deleteAccount() {
    // Implement your account deletion logic here
    console.log('Account deleted');
  } 
}
