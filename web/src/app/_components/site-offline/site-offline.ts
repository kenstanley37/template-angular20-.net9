import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { ConfigService } from '../../_services/config-service';
import { interval } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

@Component({
  selector: 'app-site-offline',
  imports: [MatCardModule, MatButtonModule, RouterLink],
  templateUrl: './site-offline.html',
  styleUrl: './site-offline.scss'
})
export class SiteOffline implements OnInit {
  constructor(private configService: ConfigService, private router: Router) { }

  ngOnInit() {
    interval(5000)
      .pipe(takeWhile(() => true, true))
      .subscribe(() => {
        this.configService.loadConfig().subscribe({
          next: (config) => {
            this.configService.setConfig(config);
            this.router.navigate(['/login']);
          },
          error: () => { } // Silent error to continue polling
        });
      });
  }
}
