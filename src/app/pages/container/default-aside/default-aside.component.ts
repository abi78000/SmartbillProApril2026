import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NAV_ITEMS, NavItem } from '../nav';
import { CommonserviceService } from '../../../services/commonservice.service';
import { forkJoin } from 'rxjs';
import { Input } from '@angular/core';
@Component({
  selector: 'app-default-aside',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './default-aside.component.html',
  styleUrls: ['./default-aside.component.css'],
})
export class DefaultAsideComponent {
  navItems: NavItem[] = NAV_ITEMS;
  
  @ViewChild('aside') aside!: DefaultAsideComponent;
  @Input() isSidebarOpen: boolean = true;
  constructor(private commonService: CommonserviceService) {}

  ngOnInit() {
    if (typeof window === 'undefined' || !window.localStorage) {
      console.warn('localStorage not available (SSR or Node context)');
      return;
    }

    const userId = Number(localStorage.getItem('userId'));
    const role = localStorage.getItem('role');
    console.log('Logged in UserID:', userId, 'Role:', role);

    if (!userId && role !== 'admin') return;

    forkJoin({
      permissions: this.commonService.getPermissionsByUser(userId),
      modules: this.commonService.getAllModules(),
    }).subscribe(({ permissions, modules }) => {
      const buildNavTree = (
        allModules: any[],
        parentId: number | null = null
      ): NavItem[] => {
        return allModules
          .filter((m) => m.parentID === parentId)
          .map((m) => ({
            label: m.label ?? 'Untitled',
            route: m.route ?? undefined,
            icon: m.icon ?? '',
            expanded: false, // important for submenu toggle
            children: buildNavTree(allModules, m.moduleID),
          }));
      };

      if (role === 'admin') {
        this.navItems = buildNavTree(modules);
      } else if (permissions.length > 0) {
        const allowedIds = permissions.map((p: any) => p.moduleID);
        const allowedModules = modules.filter((m: any) =>
          allowedIds.includes(m.moduleID)
        );
        this.navItems = buildNavTree(allowedModules);
      }
    });
  }



  // Toggle entire sidebar
  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
    if (!this.isSidebarOpen) {
      // collapse all submenus when sidebar collapses
      this.navItems.forEach(item => item.expanded = false);
    }
  }

  // Toggle a parent menu item
  toggleItem(item: NavItem) {
    if (this.isSidebarOpen && item.children) {
      item.expanded = !item.expanded;
    }
  }
  isSidebarOpenOnMobile = false;


}
