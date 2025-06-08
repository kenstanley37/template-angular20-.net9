import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Auth } from '../../../_services/auth';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-edit',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    QuillModule
  ],
  templateUrl: './article-edit.html',
  styleUrl: './article-edit.scss'
})
export class ArticleEdit {
private apiBaseUrl = import.meta.env.NG_APP_API_BASE_URL;
  articleId: number;
  currentUserId: number | null = null;
  title: string = '';
  content: string = '';

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'align': [] }],
      ['clean']
    ]
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private authService: Auth,
    private snackBar: MatSnackBar
  ) {
    this.articleId = +this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.authService.getUserInfo().subscribe({
      next: (user) => {
        this.currentUserId = user.id;
        this.loadArticle();
      },
      error: () => {
        this.snackBar.open('You must be logged in to edit articles.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
        this.router.navigate(['/login']);
      }
    });
  }

  loadArticle(): void {
    if (!this.currentUserId) {
      this.snackBar.open('You must be logged in to edit articles.', 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<any>(`${this.apiBaseUrl}/api/articles/${this.articleId}`).subscribe({
      next: (article) => {
        if (article.authorId !== this.currentUserId) {
          this.snackBar.open('You can only edit your own articles.', 'Close', { duration: 3000, panelClass: ['error-snackback'] });
          this.router.navigate(['/articles']);
          return;
        }
        this.title = article.title;
        this.content = article.content;
      },
      error: () => {
        this.snackBar.open('Failed to load article.', 'Close', { duration: 3000, panelClass: ['error-snackback'] });
        this.router.navigate(['/articles']);
      }
    });
  }

  saveArticle(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.snackBar.open('Title and content are required.', 'Close', { duration: 3000, panelClass: ['error-snack'] });
      return;
    }

    var updatedArticle = { title: this.title, content: this.content };
    this.http.put(`${this.apiBaseUrl}/api/articles/${this.articleId}`, updatedArticle, { withCredentials: true }).subscribe({
      next: () => {
        this.snackBar.open('Article updated successfully.', 'Successfully', { duration: 3000, panelClass: ['success-snack'] });
        this.router.navigate(['/articles']);
      },
      error: (error) => {
        this.snackBar.open(error.error || 'Failed to save article.', 'Close', { duration: 3000, panelClass: ['error-snack'] });
      }
    });
  }
}
