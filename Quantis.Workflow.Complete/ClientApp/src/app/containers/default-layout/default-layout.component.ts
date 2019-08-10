import { Component, OnDestroy, Inject, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { navItems } from '../../_nav';
import { AuthService } from '../../_services';
import { Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { filter } from 'rxjs/operators';
import { ObservableLike } from 'rxjs';
import { DashboardService, EmitterService } from '../../_services';
import { WidgetModel, DashboardModel } from "../../_models";

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
  private currentUrl = '0.0.1';
  public currentVerion = '0.0.1';
  public returnedNode:any;
  currentUser: any;
  loading: boolean = true;
  dashboardCollection: DashboardModel[];
  constructor(
    private toastr: ToastrService,
    private authService: AuthService,
    private router: Router,
    private dashboardService: DashboardService,
    private emitter: EmitterService,
    @Inject(DOCUMENT) _document?: any
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
    this.router.events.pipe(
      filter((event:any) => event instanceof NavigationEnd)
    ).subscribe(x => {
      this.currentUrl = x.url;
      this.findUrlDataByName(this.navItems, this.currentUrl);
      // Danial: was getting error so commented. check later
      // this.currentVerion = this.returnedNode.version || '0.0.1';
      this.currentVerion = '0.0.1';
    });
    
    // We make get request to get all dashboards from our REST API
		this.dashboardService.getDashboards().subscribe(dashboards => {
      this.emitter.loadingStatus(false);
      this.dashboardCollection = dashboards;
      console.log('getDashboards', dashboards);
    }, error => {
      console.error('getDashboards', error);
      this.toastr.error('Error while loading dashboards');
      this.emitter.loadingStatus(false);
    });
    this.emitter.getData().subscribe(data => {
      if(data.type === 'loading') {
        if(this.loading !== data.loading) {
          setTimeout(() => {
            this.loading = data.loading;
          })
          
        }
      }
    })
    
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

  dashboardNavigation(id) {
    this.router.navigate(['/dashboard/dashboard', id]);
  }
  
  dashboardList() {
    this.router.navigate(['/dashboard/list']);
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

  findUrlDataByName(itemsArray, url) {
    if(itemsArray){
      itemsArray.forEach((item:any)=>{
        if(item.url === url){
          this.returnedNode = item;
        }
        if (item.children) {
          this.findUrlDataByName(item.children, url);
        } else {
        }
      });
    }
  }


}
