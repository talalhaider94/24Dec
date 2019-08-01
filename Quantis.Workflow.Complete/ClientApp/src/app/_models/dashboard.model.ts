export interface WidgetModel {
    name: string;
    uiidentifier: string;
    createdon: Date;
    help: string;
    iconurl: string;
    id: number;
    url: string;
    widgetcategoryname: string;
    wigetcategoryid: number;
}

export interface DashboardContentModel {
    cols: number;
    rows: number;
    y: number;
    x: number;
    minItemRows?: number;
    minItemCols?: number;
    component?: any;
    name: string;
}

export interface DashboardModel {
    id: number;
    username: string;
    dashboard: Array<DashboardContentModel>;
}

// export const WidgetsMock: WidgetModel[] = [
//     {
//         name: 'Radar Chart',
//         identifier: 'radar_chart'
//     },
//     {
//         name: 'Doughnut Chart',
//         identifier: 'doughnut_chart'
//     },
//     {
//         name: 'Line Chart',
//         identifier: 'line_chart'
//     }
// ]