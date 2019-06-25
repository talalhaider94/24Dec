import { Component, OnDestroy, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { navItems } from '../../_nav';
import { AuthService } from '../../_services';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnDestroy, OnInit {
  public navItems = [];
  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement;
  currentUser: any;
  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(DOCUMENT) _document?: any,
  ) {

    this.changes = new MutationObserver((mutations) => {
      this.sidebarMinimized = _document.body.classList.contains('sidebar-minimized');
    });
    this.element = _document.body;
    this.changes.observe(<Element>this.element, {
      attributes: true,
      attributeFilter: ['class']
    });
  }

  ngOnInit() {
    this.currentUser = this.authService.getUser();
    // const hiddenAdminItemsUrl = ['/archivedkpi', '/configurazione', '/workload', '/workflow', '/report', '/loading-form/utente', '/catalogo/kpi'];
    const hiddenAdminItemsUrl = [];
    if (!this.currentUser.issuperadmin && this.currentUser.isadmin) {
      this.navItems = navItems.filter((item) => {
        if (hiddenAdminItemsUrl.indexOf(item.url) < 0) {
          if (item.children && item.children.length > 0) {
            const mod_children = item.children.filter((child) => {
              if (hiddenAdminItemsUrl.indexOf(child.url) < 0) {
                return child;
              }
            });
            item.children = mod_children;
          }
          return item;
        }
      });
    } else {
      this.navItems = navItems;
    }
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }

  logout() {
    this.authService.logout();

  }

}
