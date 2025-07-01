import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './_services/config-service';
import { authInterceptor } from './_interceptors/auth-interceptor';
import { AuthService } from './_services/auth-service';
// This file configures the Angular application with necessary providers and initializers.
// It sets up routing, animations, HTTP client, and social authentication services.



export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),

    provideAppInitializer(async () => {
      const configService = inject(ConfigService);
      const auth = inject(AuthService);
      const router = inject(Router);

      try {
        // Load configuration and user profile
        // 
        const config = await firstValueFrom(configService.loadConfig());
        console.log("Startup checking auth");
        //await auth.checkAuthStatus().subscribe();
        await firstValueFrom(auth.checkAuthStatus());
        configService.setConfig(config);
      } catch (error) {
        console.error('Initialization error:', error);
        await router.navigate(['/offline']);
      }
    }),
  ]
};