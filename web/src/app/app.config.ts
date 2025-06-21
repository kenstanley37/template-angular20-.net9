import { APP_INITIALIZER, ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './_services/config-service';
//import { SocialAuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from '@abacritt/angularx-social-login';
import { authInterceptor } from './_interceptors/auth-interceptor';
import { AuthService } from './_services/auth-service';
// This file configures the Angular application with necessary providers and initializers.
// It sets up routing, animations, HTTP client, and social authentication services.



export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),

    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      const authService = inject(AuthService);
      const router = inject(Router);

      try {
        const config = await firstValueFrom(configService.loadConfig());
        const userProfile = await firstValueFrom(authService.getProfile());
        configService.setConfig(config);
      } catch (error) {
        console.error('Initialization error:', error);
        await router.navigate(['/offline']);
      }
    }),

    // Optional: Provide config and auth service explicitly if needed elsewhere
    // These factories below are not required unless you use these tokens elsewhere
    // {
    //   provide: 'AuthService',
    //   useFactory: () => inject(AuthService),
    //   deps: []
    // },
    // {
    //   provide: 'ConfigService',
    //   useFactory: () => inject(ConfigService),
    //   deps: []
    // }
  ]
};