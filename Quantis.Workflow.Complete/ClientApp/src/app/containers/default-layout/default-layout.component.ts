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
    // const hiddenItemsUrl = ['/tconfiguration'];
    const hiddenItemsUrl = [''];
    if (!this.currentUser.issuperadmin) {
      this.navItems = navItems.filter((item) => {
        if (hiddenItemsUrl.indexOf(item.url) < 0) {
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
