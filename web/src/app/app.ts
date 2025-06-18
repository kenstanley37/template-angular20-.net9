import { Component, ViewChild, signal, inject, effect, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from './_components/layout/toolbar/toolbar';
import { AuthService } from './_services/auth-service';
import { catchError, switchMap, throwError } from 'rxjs';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ProfileDto } from './_models/user-model';
import { Sidenav } from "./_components/layout/sidenav/sidenav";
import { Footer } from "./_components/layout/footer/footer";
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';


@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatListModule,
    MatDividerModule,
    MatIconModule,
    Toolbar,
    Sidenav,
    Footer
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'web';
  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  isSidenavOpen = signal(true);
  isHovering = false;
  isCollapsed = computed(() => !this.isSidenavOpen());
  isAuthenticated = signal(false);
  profile = signal<ProfileDto | null>(null);
  isMobile = signal(false);

  hideFooter = signal(false);
  lastScrollTop = 0;

  private router = inject(Router);

  constructor(private authService: AuthService, breakpointObserver: BreakpointObserver) {
    // Initialization logic can go here if needed

    effect(() => {
      breakpointObserver.observe([Breakpoints.XSmall, Breakpoints.Small])
        .subscribe(result => {
          this.isMobile.set(result.matches);
          this.isSidenavOpen.set(!result.matches); // Close on mobile
        });
    });

    // Auto-close sidenav on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isSidenavOpen.set(false);
    });

    // Check authentication status on app initialization
    this.checkAuthStatus();
  }

  onSidenavHover(state: boolean) {
  this.isHovering = state;
}


  checkAuthStatus() {
    this.authService.checkAuthStatus().subscribe({
      next: (isAuthenticated: boolean) => {
        //console.log('Authentication status:', isAuthenticated);
        this.isAuthenticated.set(isAuthenticated);
        if (isAuthenticated) {
          this.authService.getProfile().subscribe({
            next: (profile: ProfileDto) => {
              this.profile.set(profile);
            },
            error: (err) => {
              console.error('Error fetching profile:', err);
              this.profile.set(null);
            }
          });
        } else {
          this.isAuthenticated.set(false);
          this.profile.set(null);
        }
      }
    });
  }

  toggleSidenav() {
    this.isSidenavOpen.set(!this.isSidenavOpen());
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.isAuthenticated.set(false);
        this.profile.set(null);
      }
    });
  }

  refreshToken() {
    // This method can be used to manually refresh the token if needed
    // Typically, this is handled by the auth interceptor automatically
    this.authService.refreshToken().subscribe({
      next: () => {
        console.log('Token refreshed successfully')
        this.authService.getProfile().subscribe({
          next: (profile: ProfileDto) => this.profile.set(profile),
        });
      },
      error: (err) => {
        console.error('Error refreshing token:', err)
        this.router.navigate(['/login']);
      }
    });
  }
}
