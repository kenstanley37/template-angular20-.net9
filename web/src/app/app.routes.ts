import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Login } from './pages/login/login';
import { ArticleSubmit } from './pages/articles/article-submit/article-submit';
import { ArticleList } from './pages/articles/article-list/article-list';
import { ArticleEdit } from './pages/articles/article-edit/article-edit';
import { Profile } from './pages/profile/profile';
import { MfaVerify } from './pages/mfa/mfa-verify/mfa-verify';
import { MfaSetup } from './pages/mfa/mfa-setup/mfa-setup';
import { authGuard } from './_guards/auth-guard';
import { adminGuard } from './_guards/admin-guard';
import { VerifyEmail } from './pages/verify-email/verify-email';
import { AdminDashboard } from './pages/admin/admin-dashboard/admin-dashboard';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'verify-email', component: VerifyEmail },
    { path: 'dashboard', component: AdminDashboard, canActivate: [authGuard] },
    { path: 'profile', component: Profile, canActivate: [authGuard] },
    { path: 'admin-dashboard', component: AdminDashboard, canActivate: [ authGuard, adminGuard] },
    { path: 'mfa-setup', component: MfaSetup, canActivate: [authGuard] },
    { path: 'mfa-verify', component: MfaVerify },
    { path: 'submit-article', component: ArticleSubmit, canActivate: [authGuard] },
    { path: 'articles', component: ArticleList },
    { path: 'edit-article/:id', component: ArticleEdit, canActivate: [authGuard] },
    { path: '', redirectTo: '/login', pathMatch: 'full' }
];
