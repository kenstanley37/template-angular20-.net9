import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip'; // ✅ Add this
import { MatTreeModule } from '@angular/material/tree';
import { MatButtonModule } from '@angular/material/button';
import { trigger, state, style, transition, animate } from '@angular/animations';


/**
 * Food data with nested structure.
 * Each node has a name and an optional list of children.
 */
interface FoodNode {
  name: string;
  children?: FoodNode[];
}

interface SideNavLinks {
  name: string;
  route: string;
  icon: string;
  children?: SideNavLinks[]
}



@Component({
  selector: 'app-sidenav',
  imports: [MatSidenavModule, MatListModule, RouterModule, MatIconModule, MatTooltipModule, MatTreeModule, MatButtonModule],
  templateUrl: './sidenav.html',
  styleUrl: './sidenav.scss',
  animations: [
    trigger('expandCollapse', [
      state('void', style({ height: '0px', opacity: 0 })),
      transition(':enter', [animate('200ms ease-out', style({ height: '*', opacity: 1 }))]),
      transition(':leave', [animate('150ms ease-in', style({ height: '0px', opacity: 0 }))])
    ])
  ]
})
export class Sidenav implements OnChanges {

  //@Input({ required: true }) open!: boolean;
  @Input() collapsed = false;


  ngOnChanges(changes: SimpleChanges): void {

  }

  dataSource = NavLinks_Data;

  childrenAccessor = (node: SideNavLinks) => node.children ?? [];

  hasChild = (_: number, node: SideNavLinks) => !!node.children && node.children.length > 0;
}

const NavLinks_Data: SideNavLinks[] = [
  {
    name: 'Home',
    icon: 'home',
    route: '/home',
    children: [{
      name: 'Profile',
      icon: 'profile',
      route: '/profile'
    }]
  }
]