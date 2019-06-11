import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingFormService, AuthService } from '../../../_services';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-loading-form-user',
  templateUrl: './loading-form-user.component.html',
  styleUrls: ['./loading-form-user.component.scss']
})
export class LoadingFormUserComponent implements OnInit, OnDestroy {
  loadingForms: any = [];
  loading: boolean = true;
  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();

  constructor(
    private router: Router,
    private loadingFormService: LoadingFormService,
    private authService: AuthService
  ) { }

  ngOnInit() {
        // Danial TODO: Some role permission logic is needed here.
    // Admin and super admin can access this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    const currentUser = this.authService.getUser();
    this.loadingFormService.getFormsByUserId(currentUser.userid).pipe(first()).subscribe(data => {
      this.loadingForms = data;
      this.dtTrigger.next();
      this.loading = false;
    }, error => {
      console.error('LoadingFormComponent', error)
      this.loading = false;
    })
  }

  ngOnDestroy() {
    this.dtTrigger.unsubscribe();
  }
}
