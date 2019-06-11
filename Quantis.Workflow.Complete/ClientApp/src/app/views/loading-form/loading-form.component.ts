import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild  } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingFormService } from '../../_services';
import { first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';

@Component({
  // selector: 'app-loading-form',
  templateUrl: './loading-form.component.html',
  styleUrls: ['./loading-form.component.scss']
})
export class LoadingFormComponent implements OnInit, OnDestroy {
  loadingForms: any = [];
  loading: boolean = true;
  @ViewChild(DataTableDirective)
  datatableElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger = new Subject();
  constructor(
    private router: Router,
    private loadingFormService: LoadingFormService
  ) { }

  ngOnInit() {
    // Danial TODO: Some role permission logic is needed here.
    // Admin and super admin can access this
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: 10,
    };
    this.loadingFormService.getLoadingForms().pipe(first()).subscribe(data => {
      this.loadingForms = data;
      this.dtTrigger.next();
      this.loading = false;
    }, error => {
      console.error('LoadingFormComponent', error)
      this.loading = false;
    })

  }

  // clickrow(data) {
  //   this.router.navigate(['/loading-form/form', '2', '2']);
  // }
  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

}
