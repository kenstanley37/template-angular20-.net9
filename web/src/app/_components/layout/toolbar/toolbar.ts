import { Component, EventEmitter, inject, Input, OnInit, Output, Signal, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../_services/auth-service';
import { Profile } from '../../../_pages/user/profile/profile';
import { ProfileDto } from '../../../_models/user-model';
import { UserService } from '../../../_services/user-service';
import { ThemeService } from '../../../_services/theme-service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    CommonModule
  ],
  templateUrl: './toolbar.html',
  styleUrl: './toolbar.scss'
})
export class Toolbar implements OnInit {
  @Input() pinned = false;
  @Output() toggle = new EventEmitter<boolean>();

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private themeService = inject(ThemeService);
  private router = inject(Router);

  // Use Signal for reactive state management
  isSidenavOpen = signal<boolean>(false);
  hasShadow = signal(false);

  isAuthenticated = this.authService.isAuthenticated;
  profile = this.userService.userProfile;

  constructor() {
    
  }

  ngOnInit(): void {
    var storedSidenavState = localStorage.getItem('sidenavOpen');
    if (storedSidenavState) {
      this.isSidenavOpen.set(JSON.parse(storedSidenavState));
    }
  }

  toggleTheme()
  {
    console.log("Theme Toggled");
    this.themeService.toggleTheme();
  }

  onScroll(event: Event) {
    const scrollTop = (event.target as HTMLElement).scrollTop;
    this.hasShadow.set(scrollTop > 10);
  }

  toggleSidenav() {
    // Toggle the sidenav state
    this.isSidenavOpen.set(!this.isSidenavOpen());
    this.toggle.emit(this.isSidenavOpen());
    localStorage.setItem('sidenavOpen', JSON.stringify(this.isSidenavOpen()));
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/login']),
      error: (err) => console.error('Logout failed:', err)
    });
  }
}
