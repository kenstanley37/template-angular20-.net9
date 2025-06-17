import { Component, Input } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip'; // ✅ Add this

@Component({
  selector: 'app-sidenav',
  imports: [MatSidenavModule, MatListModule, RouterModule, MatIconModule, MatTooltipModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss'
})
export class Sidenav {
  //@Input({ required: true }) open!: boolean;
  @Input() collapsed = false;
}
