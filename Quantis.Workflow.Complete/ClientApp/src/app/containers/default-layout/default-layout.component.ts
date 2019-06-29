import { Component, OnDestroy, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { navItems } from '../../_nav';
import { AuthService } from '../../_services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html'
})
export class DefaultLayoutComponent implements OnDestroy, OnInit {
  permittedMenuItems = [];
  public navItems = [];
  public sidebarMinimized = true;
  private changes: MutationObserver;
  public element: HTMLElement;
  currentUser: any;
  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    @Inject(DOCUMENT) _document?: any,
    ) {
      this.currentUser = this.authService.getUser(); 
    
      this.filterMenuByPermission(navItems, this.currentUser.permissions, this.permittedMenuItems);
      this.navItems = this.permittedMenuItems; 

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
  }

  ngOnDestroy(): void {
    this.changes.disconnect();
  }

  logout() {
    this.authService.logout().subscribe(data => {
      this.authService.removeUser();
      this.toastr.success('Success', 'Logout eseguito con successo.');
      this.router.navigate(['/login']);
    });
  }

  filterMenuByPermission(navItems, permissions, permittedMenu) {
    if (navItems) {
      navItems.forEach((item:any)=>{
        let isExist:boolean =  item.title || item.divider || item.key == 'alwaysShow' || this.checkArrays(item.key === undefined ? ['$#%^&'] : typeof(item.key) === 'string' ? [item.key] : item.key, permissions);
        let cloneItem = {...{}, ...item};
        if(isExist){ // || item.title || item.divider || item.key == 'alwaysShow'
          cloneItem.children = [];
          permittedMenu.push(cloneItem);
        }
        if (item.children) {
          this.filterMenuByPermission(item.children, permissions, cloneItem.children);
        } else {
          delete cloneItem.children;
        }
      });
    }
  }

  checkArrays(arr1, arr2) {
    let isExist = false;
    arr1.forEach((item:any)=>{
      if(arr2.indexOf(item) > -1 ){
        isExist = true;
      }
    });
    return isExist;
  }

}
