import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-barchart',
  templateUrl: './barchart.component.html',
  styleUrls: ['./barchart.component.scss']
})
export class BarchartComponent implements OnInit {

	@Input() name: string;
	constructor() { }

	ngOnInit() {
		console.log('BAR CHART COMPONENT', this.name);
	}
	// barChart
	public barChartData: Array<any> = [
		{ data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
		{ data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' },
		{ data: [18, 48, 77, 9, 100, 27, 40], label: 'Series C' }
	];
	public barChartLabels: Array<any> = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
	public barChartOptions: any = {
		responsive: true
	};
	public barChartLegend: boolean = true;
	public barChartType: string = 'bar';

	public randomize(): void {
		let _barChartData: Array<any> = new Array(this.barChartData.length);
		for (let i = 0; i < this.barChartData.length; i++) {
			_barChartData[i] = { data: new Array(this.barChartData[i].data.length), label: this.barChartData[i].label };
			for (let j = 0; j < this.barChartData[i].data.length; j++) {
				_barChartData[i].data[j] = Math.floor((Math.random() * 100) + 1);
			}
		}
		this.barChartData = _barChartData;
	}

	// events
	public chartClicked(e: any): void {
		console.log(e);
	}

	public chartHovered(e: any): void {
		console.log(e);
	}
}
