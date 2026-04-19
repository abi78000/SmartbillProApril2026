import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { DefaultHeaderComponent } from '../default-header/default-header.component';
import { DefaultFooterComponent } from '../default-footer/default-footer.component';

@Component({
  selector: 'app-default-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    DefaultHeaderComponent,
    DefaultFooterComponent
  ],
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.css']
})
export class DefaultLayoutComponent {
  
  hideHeader = false;

  constructor(private router: Router) {
    // Listen to route change
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        
        let child = this.router.routerState.root;

        // Walk down to deepest child route
        while (child.firstChild) {
          child = child.firstChild;
        }

        // Read hideHeader property
        this.hideHeader = child.snapshot.data['hideHeader'] || false;
      }
    });
  }
}
