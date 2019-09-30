import { Component, OnInit, ComponentRef, ViewChild } from '@angular/core';
import { GridsterConfig, GridsterItem, GridType, CompactType, DisplayGrid } from 'angular-gridster2';
import { DashboardService, EmitterService } from '../../../_services';
import { DateTimeService } from '../../../_helpers';
import { ActivatedRoute } from '@angular/router';
import { DashboardModel, DashboardContentModel, WidgetModel, ComponentCollection } from '../../../_models';
import { Subscription, forkJoin, interval } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiService } from '../../../_services/api.service';
import { UUID } from 'angular2-uuid';
import * as moment from 'moment';

@Component({
	templateUrl: 'landingpage.component.html',
	 styleUrls: ['landingpage.component.scss']
})
export class LandingPageComponent implements OnInit {
	public period = '02/2019';
	gridsData: any = [];
	bestContracts: any = [];
	monthVar: any;
  	yearVar: any;
	count = 0;
	constructor(
		private dashboardService: DashboardService,
		private apiService: ApiService,
		private _route: ActivatedRoute,
		private emitter: EmitterService,
		private toastr: ToastrService,
		private formBuilder: FormBuilder,
		private dateTime: DateTimeService
	) { }
	ngOnInit(): void {
		this.getAnno();
		//this.period = this.monthVar/this.yearVar
		// this.apiService.getLandingPage(2,2019).subscribe((data: any) => {
		// 	this.gridsData = data;
		// 	console.log("Landing Page Data: ", this.gridsData);			
		// });
	}

	populateDateFilter() {    
		if(this.monthVar==null || this.yearVar==null){

		}else{
			this.apiService.getLandingPage(this.monthVar,this.yearVar).subscribe((data: any) => {
				this.gridsData = data;
				console.log("Month Year Var -> ", this.monthVar, this.yearVar);			
			});
		}
	 }

	anni=[];
	//+(moment().add('months', 6).format('YYYY'))
	getAnno(){
		for (var i = 2016; i <=+(moment().add('months', 7).format('YYYY')); i++) {
			this.anni.push(i);
		}
		return this.anni;
	}
}
