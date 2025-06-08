import { Component, EventEmitter, Inject, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '../../_services/auth';
import { Theme } from '../../_services/theme';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toolbar',
  imports: [
    CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatRadioModule
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss'
})
export class Toolbar implements OnInit {
  @Output() toggleSidenav = new EventEmitter<void>();
  isLoggedIn: boolean = false;
  selectedTheme: string = 'light-theme';
  themes = [
    { value: 'light-theme', label: 'Light Theme' },
    { value: 'dark-theme', label: 'Dark Theme' }
  ];


  constructor(
    @Inject(Auth) private authService: Auth,
    @Inject(Theme) private themeService: Theme,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(loggedIn => this.isLoggedIn = loggedIn);
    this.themeService.getTheme().subscribe(theme => {
      this.selectedTheme = theme;
    });
  }

  changeTheme(theme: string): void {
    this.themeService.setTheme(theme);
  }

  navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  signOut(): void {
    this.authService.signOut();
  }

  onToggleSidenav(): void {
    this.toggleSidenav.emit();
  }

}
