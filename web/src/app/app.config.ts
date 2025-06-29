import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './_services/config-service';
import { authInterceptor } from './_interceptors/auth-interceptor';
import { AuthService } from './_services/auth-service';
import { UserService } from './_services/user-service';
// This file configures the Angular application with necessary providers and initializers.
// It sets up routing, animations, HTTP client, and social authentication services.



export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),

    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      const router = inject(Router);

      try {
        // Load configuration and user profile
        // 
        const config = await firstValueFrom(configService.loadConfig());
        configService.setConfig(config);
      } catch (error) {
        console.error('Initialization error:', error);
        await router.navigate(['/offline']);
      }
    }),
  ]
};