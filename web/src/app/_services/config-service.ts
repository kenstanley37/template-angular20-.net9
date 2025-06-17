import { inject, Injectable, signal } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

interface AppConfig {
  apiUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private http = inject(HttpClient);
  private config = {
    apiUrl: environment.apiUrl,
    googleClientId: '',
    facebookAppId: ''
  };

  loadConfig(): Observable<{ googleClientId: string; facebookAppId: string }> {
    return this.http.get<{ googleClientId: string; facebookAppId: string }>(`${environment.apiUrl}/config`);
  }

  setConfig(config: Partial<{ googleClientId: string; facebookAppId: string }>) {
    this.config = { ...this.config, ...config };
  }

  getConfig() {
    return this.config;
  }
}
