import { Component, OnInit, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { DashboardService, AuthService } from '../../../_services';
import { debug } from 'util';

@Component({
  selector: 'app-dashboard-lists',
  templateUrl: './dashboard-lists.component.html',
  styleUrls: ['./dashboard-lists.component.scss']
})
export class DashboardListsComponent implements OnInit {
  loading: boolean = false;
  formLoading: boolean = false;
  submitted: boolean = false;
  dashboards: Array<any> = [];
  createDashboardForm: FormGroup;

  @ViewChild('createDashboardModal') public createDashboardModal: ModalDirective;
  constructor(
    private dashboardService: DashboardService,
    private toastr: ToastrService,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) { }

  get f() { return this.createDashboardForm.controls; }

  ngOnInit() {
    this.createDashboardForm = this.formBuilder.group({
      id: ['', Validators.required],
      name: ['', Validators.required],
      owner: ['', Validators.required],
      globalfilterId: ['', Validators.required],
      createdon: ['', Validators.required],
      dashboardwidgets: [''],
    });
    this.getUserDashboards();
  }

  getUserDashboards() {
    this.loading = true;
    this.dashboardService.getDashboards().subscribe(dashboards => {
      this.dashboards = dashboards;
      this.loading = false;
    }, error => {
      console.error('getDashboards', error);
      this.toastr.error('Error while loading dashboards');
      this.loading = false;
    });
  }

  createDashboard() {
    let loggedInUser = this.authService.currentUserValue;
    this.createDashboardForm.patchValue({
      id: 0,
      owner: loggedInUser.username,
      globalfilterId: 0,
      createdon: new Date(),
      dashboardwidgets: []
    })
    this.createDashboardModal.show();
  }

  onDashboardFormSubmit() {
    this.submitted = true;
    if (this.createDashboardForm.invalid) {
      this.createDashboardModal.show();
    } else {
      this.createDashboardModal.show();
      this.formLoading = true;
      this.dashboardService.updateDashboard(this.createDashboardForm.value).subscribe(dashboardCreated => {
        this.createDashboardModal.hide();
        this.getUserDashboards();
        this.formLoading = false;
        this.toastr.success('Dashboard created successfully');
      }, error => {
        this.createDashboardModal.hide();
        this.formLoading = false;
        this.toastr.error('Error while creating dashboard');
      })
    }

  }

  dashboardStatus(dashboardId, status) {
    this.loading = true;
    if(status) {
      this.dashboardService.deactivateDashboard(dashboardId).subscribe(result => {
        this.loading = false;
        this.getUserDashboards();
      }, error => {
        this.loading = false;
        this.toastr.error('Error while deactivating dashboard');
      })
    } else {
      this.dashboardService.activateDashboard(dashboardId).subscribe(result => {
        this.loading = false;
        this.getUserDashboards();
      }, error => {
        this.loading = false;
        this.toastr.error('Error while activating dashboard');
      })
    }
  }
}
