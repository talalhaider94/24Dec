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
    filters: Array<any>;
    properties: Array<any>;
    widgetid: number;
    dashboardid: number;
    id: number;
    url?: string;
}

export interface DashboardModel {
    id: number;
    name: string;
    owner: string,
    createdon: Date,
    dashboardwidgets: Array<DashboardContentModel>;
}
