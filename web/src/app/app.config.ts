import { APP_INITIALIZER, ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from './_services/config-service';
//import { SocialAuthServiceConfig, GoogleLoginProvider, FacebookLoginProvider } from '@abacritt/angularx-social-login';
import { authInterceptor } from './_interceptors/auth-interceptor';
// This file configures the Angular application with necessary providers and initializers.
// It sets up routing, animations, HTTP client, and social authentication services.

// Note: APP_INITIALIZER is deprecated in Angular 20. Monitor Angular updates for a replacement.
function initializeApp() {
  const configService = inject(ConfigService);
  const router = inject(Router);
  return async () => {
    try {
      const config = await firstValueFrom(configService.loadConfig());
      configService.setConfig(config);
    } catch (error) {
      console.error('Initialization error:', error);
      await router.navigate(['/offline']);
    }
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimationsAsync(),
    {
      provide: 'ConfigService',
      useFactory: () => {
        const configService = inject(ConfigService);
        const config = configService.getConfig();
      },
      deps: [ConfigService]
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true
    }
  ]
};
