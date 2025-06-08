import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../_services/auth-service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SafeHtmlPipe } from '../../../_pipes/safe-html-pipe';

@Component({
  selector: 'app-article-list',
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    SafeHtmlPipe
  ],
  templateUrl: './article-list.html',
  styleUrl: './article-list.scss'
})
export class ArticleList implements OnInit {
private apiBaseUrl = import.meta.env['NG_APP_API_BASE_URL'];
  allArticles: any[] = [];
  userArticles: any[] = [];
  isLoggedIn: boolean = false;
  currentUserId: number | null = null;

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadAllArticles();
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
      if (loggedIn) {
        this.authService.getUserInfo().subscribe({
          next: (user) => {
            this.currentUserId = user.id;
            this.loadUserArticles();
          },
          error: () => {
            this.snackBar.open('Failed to load user info.', 'Close', { duration: 3000, panelClass: ['error-snack'] });
          }
        });
      }
    });
  }

  loadAllArticles(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/api/articles`).subscribe({
      next: (articles) => {
        this.allArticles = articles;
      },
      error: () => {
        this.snackBar.open('Failed to load articles.', 'Close', { duration: 3000, panelClass: ['error-snack'] });
      }
    });
  }

  loadUserArticles(): void {
    this.http.get<any[]>(`${this.apiBaseUrl}/api/articles/user`, { withCredentials: true }).subscribe({
      next: (articles) => {
        this.userArticles = articles;
      },
      error: () => {
        this.snackBar.open('Failed to load your articles.', 'Close', { duration: 3000, panelClass: ['error-snack'] });
      }
    });
  }
}
