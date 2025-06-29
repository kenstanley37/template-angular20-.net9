import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor() { }
  private theme = signal<'light-theme' | 'dark-theme'>('light-theme');

  currentTheme = this.theme.asReadonly();

  toggleTheme() {
    const next = this.theme() === 'light-theme' ? 'dark-theme' : 'light-theme';
    this.theme.set(next);
    document.body.classList.remove('light-theme', 'dark-theme');
    document.body.classList.add(next);
  }
  
}
