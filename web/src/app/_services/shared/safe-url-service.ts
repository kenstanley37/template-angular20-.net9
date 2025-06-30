import { inject, Injectable } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SafeUrlService {

  private sanitizer = inject(DomSanitizer);

  constructor() { }

  public sanitizeImageUrl(url: string | null | undefined): SafeUrl {
    const safeUrl = url ?? 'assets/default-avatar.png';
    return this.sanitizer.bypassSecurityTrustUrl(safeUrl);
    //return this.sanitizer.bypassSecurityTrustUrl(url ?? '');
  }
}
