import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { forkJoin } from 'rxjs';
import { filter } from 'rxjs/operators';

import { CommonserviceService } from '../../../services/commonservice.service';
import { NavItem } from '../nav';
import { SharedModule } from '../../../shared/shared.module';

@Component({
  selector: 'app-default-header',
  standalone: true,
  imports: [CommonModule, RouterModule, SharedModule],
  templateUrl: './default-header.component.html',
  styleUrls: ['./default-header.component.css'],
})
export class DefaultHeaderComponent implements OnInit {
  navItems: NavItem[] = [];
  userDropdownOpen = false;

  /** desktop hover control */
  allowHover = false;

  /** mobile menu */
  isMobileMenuOpen = false;
  isMobile = window.innerWidth <= 768;

  constructor(
    private router: Router,
    private commonService: CommonserviceService
  ) {}

  /* ================= INIT ================= */
  ngOnInit(): void {
    this.loadNavigation();

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeAllMenus();
        this.closeMobileMenu();
      });
  }

  /* ================= RESIZE ================= */
  @HostListener('window:resize')
  onResize() {
    this.isMobile = window.innerWidth <= 768;
    if (!this.isMobile) {
      this.closeMobileMenu();
    }
  }

  /* ================= NAV LOAD ================= */
  private loadNavigation(): void {
    const userId = Number(localStorage.getItem('userId'));
    const role = localStorage.getItem('role');

    if (!userId && role !== 'ADMIN') return;

    forkJoin({
      permissions: this.commonService.getPermissionsByUser(userId),
      modules: this.commonService.getAllModules(),
    }).subscribe(({ permissions, modules }) => {
      const buildTree = (
        all: any[],
        parentId: number | null = null
      ): NavItem[] =>
        all
          .filter((m) => m.parentID === parentId)
          .map((m) => ({
            label: m.label,
            route: m.route,
            icon: m.icon,
            expanded: false,
            children: buildTree(all, m.moduleID),
          }));

      if (role === 'ADMIN') {
        this.navItems = buildTree(modules);
      } else {
        const allowedIds = permissions.map((p: any) => p.moduleID);
        const allowed = modules.filter(
          (m: any) =>
            allowedIds.includes(m.moduleID) ||
            allowedIds.includes(m.parentID)
        );
        this.navItems = buildTree(allowed);
      }
    });
  }

  /* ================= DESKTOP MENU ================= */

  onMenuEnter(item: NavItem) {
    if (this.isMobile || !this.allowHover) return;
    this.navItems.forEach((i) => (i.expanded = i === item));
  }

  onMenuLeave(item: NavItem) {
    if (this.isMobile || !this.allowHover) return;
    item.expanded = false;
  }



  /* ================= MOBILE MENU ================= */
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    this.closeAllMenus();
  }

  toggleMobileItem(item: NavItem) {
    item.expanded = !item.expanded;
  }

  /* ================= USER ================= */
  toggleUserDropdown(event: Event) {
    event.stopPropagation();
    this.userDropdownOpen = !this.userDropdownOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocClick(event: Event) {
    this.allowHover = true;
    if (!(event.target as HTMLElement).closest('.user-menu')) {
      this.userDropdownOpen = false;
    }
  }

  goToProfile() {
    this.router.navigate(['/profile']);
    this.userDropdownOpen = false;
  }

  goToSettings() {
    this.router.navigate(['/settings']);
    this.userDropdownOpen = false;
  }

  logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('role');
    this.router.navigate(['/login']);
  }

  isLoggedIn() {
    return !!localStorage.getItem('userId');
  }

  getCurrentUserName() {
    return localStorage.getItem('userName') || 'User';
  }

  getCurrentUserRole() {
    return localStorage.getItem('role') || 'Guest';
  }
  onMenuClick(item: any, event: MouseEvent) {
  event.preventDefault();
  this.navItems.forEach(i => i.expanded = false);
  item.expanded = !item.expanded;
}

closeAllMenus() {
  this.navItems.forEach(i => i.expanded = false);
}

}
