import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { DashboardService, EmitterService } from '../../_services';
import { DateTimeService, WidgetHelpersService, chartExportTranslations } from '../../_helpers';
import { mergeMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import * as Highcharts from 'highcharts';
import { ToastrService } from 'ngx-toastr';
import HC_exporting from 'highcharts/modules/exporting';
import { ContextMenuComponent } from 'ngx-contextmenu';
HC_exporting(Highcharts);

@Component({
    selector: 'app-kpi-report-trend',
    templateUrl: './kpi-report-trend.component.html',
    styleUrls: ['./kpi-report-trend.component.scss']
})
export class KpiReportTrendComponent implements OnInit {
    @ViewChild(ContextMenuComponent) public basicMenu: ContextMenuComponent;
    @Input() widgetname: string;
    @Input() url: string;
    @Input() filters: any;
    @Input() properties: any;
    @Input() widgetid: number;
    @Input() dashboardid: number;
    @Input() id: number;
    loading: boolean = false;
    kpiReportTrendWidgetParameters: any;
    kpiReportTrendWidgetParameters1: any;
    setWidgetFormValues: any;
    setWidgetFormValues1: any;
    editWidgetName: boolean = true;
    groupReportCheck: boolean = false;
    @Output()
    kpiReportTrendParent = new EventEmitter<any>();

    public kpiReportTrendChartType: string = 'bar';

    contextmenu = false;
    contextmenuX = 0;
    contextmenuY = 0;

    highcharts = Highcharts;
    chartOptions = {
        lang: chartExportTranslations,
        credits: false,
        title: {
            text: 'KPI Report Trend'
        },
        xAxis: {
            type: 'date',
            categories: ['10/18', '11/18', '12/18', '01/19', '02/19']
        },
        yAxis: {
            title: {
                text: 'Values #'
            }
        },
        // plotOptions: {
        //   column: {
        //     zones: [{
        //       value: 10, // Values up to 10 (not including) ...
        //       color: 'green' // ... have the color blue.
        //     }, {
        //       color: 'red' // Values from 10 (including) and up have the color red
        //     }]
        //   }
        // },
        series: [
            {
                type: 'column',
                name: 'Values',
                data: [{ "y": 0.35451, "color": "#379457" }, { "y": 0.35081, "color": "#f86c6b" }, { "y": 0.35702, "color": "#f86c6b" }, { "y": 0.39275, "color": "#379457" }, { "y": 0.38562, "color": "#379457" }],
                color: 'black'
            },
            {
                type: 'scatter',
                name: 'Target',
                data: [2, 2, 2, 2, 2],
                marker: {
                    fillColor: 'orange'
                }
            }
        ],
        exporting: {
            enabled: true
        },
    };
    chartUpdateFlag: boolean = true;
    chartOptions1 = {
        lang: chartExportTranslations,
        credits: false,
        title: {
            text: 'KPI Report Trend'
        },
        xAxis: {
            type: 'date',
            categories: ['10/18', '11/18', '12/18', '01/19', '02/19']
        },
        yAxis: {
            title: {
                text: 'Values #'
            }
        },
        series: [
            {
                type: 'column',
                name: 'Values',
                data: [{ "y": 0.35451, "color": "#379457" }, { "y": 0.35081, "color": "#f86c6b" }, { "y": 0.35702, "color": "#f86c6b" }, { "y": 0.39275, "color": "#379457" }, { "y": 0.38562, "color": "#379457" }],
                color: 'black'
            },
            {
                type: 'scatter',
                name: 'Target',
                data: [2, 2, 2, 2, 2],
                marker: {
                    fillColor: 'orange'
                }
            }
        ],
        exporting: {
            enabled: true
        },
    };
    chartUpdateFlag1: boolean = true;
    constructor(
        private dashboardService: DashboardService,
        private emitter: EmitterService,
        private dateTime: DateTimeService,
        private router: Router,
        private widgetHelper: WidgetHelpersService,
        private toastr: ToastrService
    ) { }

    ngOnInit() {
        console.log('KPI REPORT TREND ==>', this.filters, this.properties);
        this.chartOptions.title = {
            text: this.widgetname,
        };
        this.chartUpdateFlag = true;
        if (this.router.url.includes('dashboard/public')) {
            this.editWidgetName = false;
            if (this.url) {
                this.emitter.loadingStatus(true);
                this.loading = true;

                if (this.filters.hasOwnProperty('contractParties') &&
                    this.filters.hasOwnProperty('contracts') && this.filters.hasOwnProperty('kpi')) {
                    this.getComboxBoxesSet(this.filters.contractParties, this.filters.contracts).subscribe(result => {
                        const [contractParties, contracts, kpis] = result;
                        this.getChartParametersAndData(this.url, { contractParties, contracts, kpis });
                    }, error => {
                        console.error(this.widgetname, error);
                        this.toastr.error('Unable to get KPIs', this.widgetname);
                    });
                } else {
                    this.dashboardService.getContractParties().subscribe(contractParties => {
                        this.getChartParametersAndData(this.url, {contractParties});
                    }, error => {
                        console.error('getContractParties', error);
                        this.toastr.error('Unable to get Contract Parties', this.widgetname);
                    });
                }
                // TODO: groupReportCheck
                // if (this.groupReportCheck) {
                    if (this.filters.hasOwnProperty('contractParties1') &&
                        this.filters.hasOwnProperty('contracts1') && this.filters.hasOwnProperty('kpi1')) {
                            this.getComboxBoxesSet(this.filters.contractParties1, this.filters.contracts1).subscribe(result => {
                                const [contractParties, contracts, kpis] = result;
                                this.getChartParametersAndData1(this.url, { contractParties, contracts, kpis });
                            }, error => {
                                console.error(this.widgetname, error);
                                this.toastr.error('Unable to get KPIs', this.widgetname);
                            });
                    } else {
                        this.dashboardService.getContractParties().subscribe(contractParties => {
                            this.getChartParametersAndData1(this.url, {contractParties});
                        }, error => {
                            console.error('getContractParties', error);
                            this.toastr.error('Unable to get Contract Parties', this.widgetname);
                        });
                    }
                // } else {
                //     debugger
                // }
            }
            // coming from dashboard or public parent components
            this.subscriptionForDataChangesFromParent();
            this.subscriptionForDataChangesFromParent1();
        }
        window.dispatchEvent(new Event('resize'));
    }

    subscriptionForDataChangesFromParent() {
        this.emitter.getData().subscribe(result => {
            const { type, data } = result;
            if (type === 'kpiReportTrendChart') {
                let currentWidgetId = data.kpiReportTrendWidgetParameters.id;
                if (currentWidgetId === this.id) {
                    // updating parameter form widget setValues
                    let kpiReportTrendFormValues = data.kpiReportTrendWidgetParameterValues;
                    if (kpiReportTrendFormValues.Filters.daterange) {
                        kpiReportTrendFormValues.Filters.daterange = this.dateTime.buildRangeDate(kpiReportTrendFormValues.Filters.daterange);
                    }
                    this.setWidgetFormValues = kpiReportTrendFormValues;
                    this.updateChart(data.result.body, data, null);
                }
            }
        });
    }

    subscriptionForDataChangesFromParent1() {
        this.emitter.getData().subscribe(result => {
            const { type, data } = result;
            if (type === 'kpiReportTrendChart1') {
                let currentWidgetId = data.kpiReportTrendWidgetParameters.id;
                if (currentWidgetId === this.id) {
                    this.groupReportCheck = data.kpiReportTrendWidgetParameterValues.Filters.groupReportCheck;
                    // updating parameter form widget setValues
                    let kpiReportTrendFormValues = data.kpiReportTrendWidgetParameterValues;
                    if (kpiReportTrendFormValues.Filters.daterange) {
                        console.log('kpiReportTrendFormValues.Filters.daterange 1', kpiReportTrendFormValues.Filters.daterange)
                        kpiReportTrendFormValues.Filters.daterange = this.dateTime.buildRangeDate(kpiReportTrendFormValues.Filters.daterange);
                    }
                    this.setWidgetFormValues1 = kpiReportTrendFormValues;
                    this.updateChart1(data.result.body, data, null);
                }
            }
        });
    }

    // invokes on component initialization
    getChartParametersAndData(url, comboxBoxesResult) {
        // these are default parameters need to update this logic
        // might have to make both API calls in sequence instead of parallel
        let myWidgetParameters = null;
        this.dashboardService.getWidgetParameters(url).pipe(
            mergeMap((getWidgetParameters: any) => {
                myWidgetParameters = getWidgetParameters;
                // Map Params for widget index when widgets initializes for first time
                const newParams = this.widgetHelper.initWidgetParameters(getWidgetParameters, this.filters, this.properties);
                if(newParams.Filters.hasOwnProperty('kpi1')) {
                    delete newParams.Filters.kpi1;
                }
                return this.dashboardService.getWidgetIndex(url, newParams);
            })
        ).subscribe(getWidgetIndex => {
            // populate modal with widget parameters
            let kpiReportTrendParams;
            if (myWidgetParameters) {
                myWidgetParameters.allContractParties = comboxBoxesResult.contractParties;
                myWidgetParameters.allContracts = comboxBoxesResult.contracts;
                myWidgetParameters.allKpis = comboxBoxesResult.kpis;
                kpiReportTrendParams = {
                    type: 'kpiReportTrendParams',
                    data: {
                        ...myWidgetParameters,
                        widgetname: this.widgetname,
                        url: this.url,
                        filters: this.filters, // this.filter/properties will come from individual widget settings
                        properties: this.properties,
                        widgetid: this.widgetid,
                        dashboardid: this.dashboardid,
                        id: this.id
                    }
                }
                this.kpiReportTrendWidgetParameters = kpiReportTrendParams.data;
                // setting initial Paramter form widget values
                this.setWidgetFormValues = this.widgetHelper.setWidgetParameters(myWidgetParameters, this.filters, this.properties);
            }
            // popular chart data
            if (getWidgetIndex) {
                const chartIndexData = getWidgetIndex.body;
                // third params is current widgets settings current only used when
                // widgets loads first time. may update later for more use cases
                this.updateChart(chartIndexData, null, kpiReportTrendParams.data);
            }
            this.loading = false;
            this.emitter.loadingStatus(false);
        }, error => {
            console.error('KPI Report Trend', error);
            this.toastr.error('Unable to get widget data', this.widgetname);
            this.loading = false;
            this.emitter.loadingStatus(false);
        });
    }

    openModal() {
        const chart1Parameters =  this.kpiReportTrendWidgetParameters1;
        const chart1SetFormValues = this.setWidgetFormValues1;
        if(chart1Parameters) {
            if(chart1Parameters.hasOwnProperty('allContractParties1')) {
                this.kpiReportTrendWidgetParameters.allContractParties1 = chart1Parameters.allContractParties1;
            }
            if(chart1Parameters.hasOwnProperty('allContracts1')) {
                this.kpiReportTrendWidgetParameters.allContracts1 = chart1Parameters.allContracts1;
            }
            if(chart1Parameters.hasOwnProperty('allKpis1')) {
                this.kpiReportTrendWidgetParameters.allKpis1 = chart1Parameters.allKpis1;
            }
        }
        
        if(chart1SetFormValues) {
            if(chart1SetFormValues.Filters.hasOwnProperty('contractParties1')) {
                this.setWidgetFormValues.Filters.contractParties1 = chart1SetFormValues.Filters.contractParties1;
            }
            if(chart1SetFormValues.Filters.hasOwnProperty('allContracts1')) {
                this.setWidgetFormValues.Filters.contracts1 = chart1SetFormValues.Filters.contracts1;
            }
            if(chart1SetFormValues.Filters.hasOwnProperty('allKpis1')) {
                this.setWidgetFormValues.Filters.kpi1 = chart1SetFormValues.Filters.kpi1;
            }
        }

        this.kpiReportTrendParent.emit({
            type: 'openKpiReportTrendModal',
            data: {
                kpiReportTrendWidgetParameters: this.kpiReportTrendWidgetParameters,
                setWidgetFormValues: this.setWidgetFormValues,
                isKpiReportTrendComponent: true
            }
        });
    }
    closeModal() {
        this.emitter.sendNext({ type: 'closeModal' });
    }
    // dashboardComponentData is result of data coming from
    // posting data to parameters widget
    updateChart(chartIndexData, dashboardComponentData, currentWidgetComponentData) {
        if (dashboardComponentData) {
            let charttype = dashboardComponentData.kpiReportTrendWidgetParameterValues.Properties.charttype;
            setTimeout(() => {
                this.kpiReportTrendChartType = charttype;
            });
        }
        if (currentWidgetComponentData) {
            this.kpiReportTrendChartType = Object.keys(currentWidgetComponentData.charttypes)[0];
        }
        if (!chartIndexData.length) {
            this.chartOptions.title = {
                text: `No data in ${this.widgetname}.`,
            };
        } else {
            this.chartOptions.title = {
                text: this.widgetname,
            };
        }
        let targetData = chartIndexData.filter(data => data.zvalue === 'Target');
        let valueData = chartIndexData.filter(data => data.zvalue === 'Value');
        if (valueData.length > 0) {
            this.chartOptions.yAxis.title = {
                text: 'Values | ' + valueData[0].description.split('|')[1]
            }
        }
        let allChartLabels = chartIndexData.map(label => label.xvalue);

        let allTargetData = targetData.map(data => data.yvalue);
        let allValuesData = valueData.map(data => ({
            y: data.yvalue,
            name: data.description,
            color: data.description.includes('non compliant') ? '#f86c6b' : '#379457',
        }));
        this.chartOptions.xAxis = {
            type: 'date',
            categories: allChartLabels,
        }
        this.chartOptions.series[0] = {
            type: 'column',
            name: 'Values',
            data: allValuesData,
            color: 'black'
        };
        this.chartOptions.series[1] = {
            type: 'scatter',
            name: 'Target',
            data: allTargetData,
            marker: {
                fillColor: '#ffc107'
            }
        };

        this.chartUpdateFlag = true;
        window.dispatchEvent(new Event('resize'));
        this.closeModal();
    }

    widgetnameChange(event) {
        this.emitter.sendNext({
            type: 'changeWidgetName',
            data: {
                widgetname: event,
                id: this.id,
                widgetid: this.widgetid
            }
        });
    }

    getComboxBoxesSet(contractParties, contracts) {
        const allContractParties = this.dashboardService.getContractParties();
        const allContracts = this.dashboardService.getContract(0, contractParties);
        const allKpis = this.dashboardService.getKPIs(0, contracts);
        return forkJoin([allContractParties, allContracts, allKpis]);
    }

    updateChart1(chartIndexData, dashboardComponentData, currentWidgetComponentData) {
        if (dashboardComponentData) {
            let charttype = dashboardComponentData.kpiReportTrendWidgetParameterValues.Properties.charttype;
            setTimeout(() => {
                this.kpiReportTrendChartType = charttype;
            });
        }
        if (currentWidgetComponentData) {
            this.kpiReportTrendChartType = Object.keys(currentWidgetComponentData.charttypes)[0];
        }
        if (!chartIndexData.length) {
            this.chartOptions1.title = {
                text: `No data in ${this.widgetname}.`,
            };
        } else {
            this.chartOptions1.title = {
                text: this.widgetname,
            };
        }
        let targetData = chartIndexData.filter(data => data.zvalue === 'Target');
        let valueData = chartIndexData.filter(data => data.zvalue === 'Value');
        if (valueData.length > 0) {
            this.chartOptions1.yAxis.title = {
                text: 'Values | ' + valueData[0].description.split('|')[1]
            }
        }
        let allChartLabels = chartIndexData.map(label => label.xvalue);

        let allTargetData = targetData.map(data => data.yvalue);
        let allValuesData = valueData.map(data => ({
            y: data.yvalue,
            name: data.description,
            color: data.description.includes('non compliant') ? '#f86c6b' : '#379457',
        }));
        this.chartOptions1.xAxis = {
            type: 'date',
            categories: allChartLabels,
        }
        this.chartOptions1.series[0] = {
            type: 'column',
            name: 'Values',
            data: allValuesData,
            color: 'black'
        };
        this.chartOptions1.series[1] = {
            type: 'scatter',
            name: 'Target',
            data: allTargetData,
            marker: {
                fillColor: '#ffc107'
            }
        };

        this.chartUpdateFlag1 = true;
        window.dispatchEvent(new Event('resize'));
        this.closeModal();
    }

    getChartParametersAndData1(url, comboxBoxesResult) {
        // these are default parameters need to update this logic
        // might have to make both API calls in sequence instead of parallel
        let myWidgetParameters = null;
        this.dashboardService.getWidgetParameters(url).pipe(
            mergeMap((getWidgetParameters: any) => {
                myWidgetParameters = getWidgetParameters;
                // Map Params for widget index when widgets initializes for first time
                const newParams = this.widgetHelper.initWidgetParameters(getWidgetParameters, this.filters, this.properties);
                if(newParams.Filters.hasOwnProperty('kpi')) {
                    delete newParams.Filters.kpi;
                }
                if(newParams.Filters.hasOwnProperty('kpi1')) {
                    newParams.Filters.kpi = newParams.Filters.kpi1;
                    delete newParams.Filters.kpi1;
                }
                if(newParams.Filters.hasOwnProperty('groupReportCheck')) {
                    this.groupReportCheck = newParams.Filters.groupReportCheck;
                }
                return this.dashboardService.getWidgetIndex(url, newParams);
            })
        ).subscribe(getWidgetIndex => {
            // populate modal with widget parameters
            let kpiReportTrendParams;
            if (myWidgetParameters) {
                myWidgetParameters.allContractParties1 = comboxBoxesResult.contractParties;
                myWidgetParameters.allContracts1 = comboxBoxesResult.contracts;
                myWidgetParameters.allKpis1 = comboxBoxesResult.kpis;
                kpiReportTrendParams = {
                    type: 'kpiReportTrendParams',
                    data: {
                        ...myWidgetParameters,
                        widgetname: this.widgetname,
                        url: this.url,
                        filters: this.filters, // this.filter/properties will come from individual widget settings
                        properties: this.properties,
                        widgetid: this.widgetid,
                        dashboardid: this.dashboardid,
                        id: this.id
                    }
                }
                this.kpiReportTrendWidgetParameters1 = kpiReportTrendParams.data;
                // setting initial Paramter form widget values
                this.setWidgetFormValues1 = this.widgetHelper.setWidgetParameters(myWidgetParameters, this.filters, this.properties);
            }
            // popular chart data
            if (getWidgetIndex) {
                const chartIndexData = getWidgetIndex.body;
                // third params is current widgets settings current only used when
                // widgets loads first time. may update later for more use cases
                this.updateChart1(chartIndexData, null, kpiReportTrendParams.data);
            }
            this.loading = false;
            this.emitter.loadingStatus(false);
        }, error => {
            console.error('KPI Report Trend', error);
            this.toastr.error('Unable to get widget data', this.widgetname);
            this.loading = false;
            this.emitter.loadingStatus(false);
        });
    }

    public chartClicked(e: any): void {
        console.log('Chart Clicked -> ',this.filters.daterange);
        window.open(`/#/datigrezzi/?contractPartyId=${this.filters.contractParties}&contractId=${this.filters.contracts}&kpiId=${this.filters.kpi}&dateRange=${this.filters.daterange}`, '_blank');
    }

    onrightClick(e){
        this.contextmenuX = e.clientX
        this.contextmenuY = e.clientY
        this.contextmenu = true;

        console.log('this.contextmenu -> ',this.contextmenu)
    }

    showMessage(message: any) {
        console.log(message);
    }

}
