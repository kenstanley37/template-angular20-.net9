import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { ConfigService } from '../../../_services/config-service';

@Component({
  selector: 'app-google-ads',
  imports: [CommonModule],
  templateUrl: './google-ads.html',
  styleUrl: './google-ads.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoogleAds implements OnInit, AfterViewInit {
  
  private configService = inject(ConfigService);

  @Input() adClient: string = this.configService.getConfig().adSenseId; // default fallback
  @Input() adSlot!: string; // required
  @Input() adFormat: string = 'auto';
  @Input() fullWidthResponsive: string = 'true';

  @ViewChild('adRef', { static: true }) adRef!: ElementRef<HTMLDivElement>;

  private sanitizer = inject(DomSanitizer);
  adLoaded = signal(false);
  adInitialized = signal(false);

  ngOnInit(): void {
    if (!this.isScriptLoaded()) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.setAttribute('data-ad-client', this.adClient);
      document.head.appendChild(script);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      try {
        const ins = this.adRef?.nativeElement;
        if (ins && !ins.classList.contains('ads-loaded')) {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          ins.classList.add('ads-loaded');
        }
      } catch (e) {
        console.warn('AdSense failed to load:', e);
      }
    }, 0);
  }

  private isScriptLoaded(): boolean {
    return !!document.querySelector(
      'script[src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'
    );
  }

}
