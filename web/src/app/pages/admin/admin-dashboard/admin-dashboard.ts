import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ConfirmDialog } from '../../../_components/confirm-dialog/confirm-dialog';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss'
})

export class AdminDashboard implements OnInit {
  private apiBaseUrl = import.meta.env.NG_APP_API_BASE_URL;
  users: any[] = [];
  displayedColumns: string[] = ['id', 'userName', 'email', 'isAdmin', 'actions'];

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/api/user`, { withCredentials: true }).subscribe({
      next: (users) => this.users = users,
      error: () => this.snackBar.open('Failed to load users.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
    });
  }

  toggleAdmin(user: any): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      data: { message: `Toggle admin status for ${user.userName}?` }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.http.put(`${this.apiBaseUrl}/api/user/${user.id}/toggle-admin`, {}, { withCredentials: true }).subscribe({
          next: () => {
            this.snackBar.open('Admin status toggled.', 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
            this.loadUsers();
          },
          error: () => this.snackBar.open('Failed to toggle admin status.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] })
        });
      }
    });
  }
}
