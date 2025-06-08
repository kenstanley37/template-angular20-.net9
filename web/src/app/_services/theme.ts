import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class Theme {

  private themeSubject = new BehaviorSubject<string>('light-theme');
  private currentTheme: string = 'light-theme';

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    this.setTheme(savedTheme);
  }

  setTheme(theme: string): void {
    if (this.currentTheme !== theme) {
      document.body.classList.remove(this.currentTheme);
      document.body.classList.add(theme);
      localStorage.setItem('theme', theme);
      this.currentTheme = theme;
      this.themeSubject.next(theme);
    }
  }

  getTheme(): Observable<string> {
    return this.themeSubject.asObservable();
  }
    
}
