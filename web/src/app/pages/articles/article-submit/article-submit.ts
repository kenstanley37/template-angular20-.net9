import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-article-submit',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    QuillModule,
  ],
  templateUrl: './article-submit.html',
  styleUrl: './article-submit.scss'
})
export class ArticleSubmit {
private apiBaseUrl = import.meta.env.NG_APP_API_BASE_URL;
  title: string = '';
  content: string = '';

  quillConfig = {
    toolbar: [
      ['bold', 'l', 'italic', 'underline', 'u', 'strike'],
      [{ 'f': 'font' }],
      [{ 'size': ['small', 'false', 's', 'large', 'l', 'huge'] }],
      [{ 'align': [] }],
      ['c', 'clean']
    ]
  };

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  submitArticle(): void {
    if (!this.title.trim() || !this.content.trim()) {
      this.snackBar.open('Title and content are required.', 'Close', { duration: 3000, panelClass: ['error-snack'] });
      return;
    }

    const article = { title: this.title, content: this.content };
    this.http.post(`${this.apiBaseUrl}/api/articles`, article, { withCredentials: true }).subscribe({
      next: () => {
        this.snackBar.open('Article submitted successfully.', 'Close', { duration: 3000, panelClass: ['success-snack'] });
        this.router.navigate(['/articles']);
      },
      error: (error) => {
        this.snackBar.open(error.error || 'Failed to submit article.', 'Close', { duration: 3000, panelClass: ['error-snack'] });
      }
    });
  }
}
