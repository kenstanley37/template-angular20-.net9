import { Routes } from '@angular/router';
import { Login } from './_pages/auth/login/login';
import { Register } from './_pages/auth/register/register';
import { SiteOffline } from './_components/site-offline/site-offline';
import { VerifyEmail } from './_components/verify-email/verify-email';
import { Profile } from './_pages/user/profile/profile';
import { Home } from './_pages/home/home';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'offline', component: SiteOffline },
    { path: 'verify-email', component: VerifyEmail },
    { path: 'profile', component: Profile },
    { path: '**', redirectTo: '/login' }
];
// Note: The '**' wildcard route should be the last route in the array to catch all unmatched paths.
// This ensures that any undefined routes will redirect to the login page, providing a fallback for navigation.