import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toolbar } from "./components/toolbar/toolbar";
import { Footer } from "./components/footer/footer";
import { Auth } from './_services/auth';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet, 
    Toolbar, 
    Footer, 
    CommonModule,
    MatSidenavModule, 
    MatListModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  @ViewChild('sidenav') sidenav!: MatSidenav;

  constructor(
    @Inject(Auth) private authService: Auth, 
    private router: Router
  ) {}

   ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(loggedIn => this.isLoggedIn = loggedIn);
    this.authService.isAdmin$.subscribe(isAdmin => this.isAdmin = isAdmin);
  }

  toggleSidenav(): void {
    this.sidenav.toggle();
  }

  signOut(): void {
    this.authService.signOut();
    this.router.navigate(['/login']);
  }
}

