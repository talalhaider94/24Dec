interface NavAttributes {
  [propName: string]: any;
}
interface NavWrapper {
  attributes: NavAttributes;
  element: string;
}
interface NavBadge {
  text: string;
  variant: string;
}
interface NavLabel {
  class?: string;
  variant: string;
}

export interface NavData {
  name?: string;
  key?: any;
  url?: string;
  icon?: string;
  badge?: NavBadge;
  title?: boolean;
  version?: string;
  children?: NavData[];
  variant?: string;
  attributes?: NavAttributes;
  divider?: boolean;
  class?: string;
  label?: NavLabel;
  wrapper?: NavWrapper;
}

export const navItems: NavData[] = [
  /*{ // TEMP HIDDEN
    name: 'Dashboard',
    key: '',
    url: '/dashboard',
    icon: 'icon-speedometer',
    badge: {
      variant: 'info',
      text: ''
    }
  },*/
  {
    title: true,
    name: 'Menu',
    key: 'alwaysShow'
  },
  /*{ // TEMP HIDDEN
    name: 'Home',
    url: '/coming-soon',
    icon: 'icon-home',
    key: ['', ''],
    children: [
      { // TEMP HIDDEN
        name: 'Contraenti',
        url: '/coming-soon',
        icon: 'fa fa-th-list',
        key: '',
      },
      { // TEMP HIDDEN
        name: 'Contratti',
        url: '/coming-soon',
        icon: 'fa fa-file-text',
        key: '',
      },
    ]
  },*/
  {
    name: 'Workflow',
    url: '/workflow-menu',
    icon: 'fa fa-code-fork',
    key: ['VIEW_WORKFLOW_KPI_VERIFICA', 'VIEW_WORKFLOW_RICERCA', 'VIEW_WORKFLOW_ADMIN'],
    children: [
      {
        name: 'KPI in Verifica',
        url: '/workflow/verifica',
        icon: 'fa fa-file-text-o',
        version: '0.1.5',
        key: 'VIEW_WORKFLOW_KPI_VERIFICA'
      },
      {
        name: 'Ricerca',
        url: '/workflow/ricerca',
        icon: 'fa fa-search',
        version: '0.1.5',
        key: ['VIEW_WORKFLOW_RICERCA']
      },
      {
        name: 'Amministrazione',
        url: '/workflow/amministrazione',
        icon: 'fa fa-users',
        version: '0.0.2',
        key: ['VIEW_WORKFLOW_ADMIN']
      }
    ]
  },
  {
    name: 'Catalogo',
    url: '/catalogo',
    icon: 'fa fa-folder-open-o',
    key: ['VIEW_CATALOG_KPI', 'VIEW_CATALOG_UTENTI', 'VIEW_UTENTI_DA_CONSOLIDARE', 'VIEW_KPI_DA_CONSOLIDARE'],
    children: [
      {
        name: 'KPI da Consolidare',
        url: '/catalogo/admin-kpi',
        icon: 'fa fa-file-archive-o',
        version: '0.0.1',
        key: 'VIEW_KPI_DA_CONSOLIDARE'
      },
      {
        name: 'Utenti da Consolidare',
        url: '/catalogo/admin-utenti',
        icon: 'fa fa-address-book-o',
        version: '0.0.1',
        key: 'VIEW_UTENTI_DA_CONSOLIDARE'
      },
      {
        name: 'Catalogo KPI',
        url: '/catalogo/kpi',
        icon: 'fa fa-file-archive-o',
        version: '0.0.4',
        key: 'VIEW_CATALOG_KPI'
      },
      {
        name: 'Catalogo Utenti',
        url: '/catalogo/utenti',
        icon: 'fa fa-address-book-o',
        version: '0.0.1',
        key: 'VIEW_CATALOG_UTENTI',
      },
    ]
  },
  /*{ // TEMP HIDDEN
    name: 'Report',
    url: '/coming-soon',
    icon: 'fa fa-files-o',
    key: [''],
    children: [
      { // TEMP HIDDEN
        name: 'WorkFlow Reminder',
        url: '/coming-soon',
        icon: 'fa fa-check-circle-o',
        key: '',
      }
    ]
  },*/
  {
    name: 'KPI Certificati',
    url: '/archivedkpi',
    icon: 'fa fa-archive',
    version: '0.0.4',
    key: 'VIEW_KPI_CERTICATI',
  },
  {
    name: 'Loading Form',
    url: '/loadingform-menu',
    icon: 'fa fa-pencil-square-o',
    key: ['VIEW_ADMIN_LOADING_FORM', 'VIEW_LOADING_FORM_UTENTI'],
    children: [
      {
        name: 'Admin',
        url: '/loading-form/admin',
        icon: 'fa fa-user-circle',
        version: '0.0.1',
        key: 'VIEW_ADMIN_LOADING_FORM'
      },
      {
        name: 'Utente',
        url: '/loading-form/utente',
        icon: 'fa fa-user-circle-o',
        version: '0.0.12',
        key: 'VIEW_LOADING_FORM_UTENTI'
      },
    ]
  },
  {
    name: 'Report',
    url: '/report',
    icon: 'fa fa-bar-chart',
    key: ['VIEW_NOTIFIER_EMAILS', 'VIEW_RAW_DATA', 'VIEW_DEBUG'],
    children: [
      {
        name: 'Notifiche LoadingForm',
        url: '/specialreporting',
        icon: 'fa fa-envelope',
        version: '0.0.4',
        key: 'VIEW_NOTIFIER_EMAILS'
      },
      {
        name: 'Dati Grezzi',
        url: '/datigrezzi',
        icon: 'fa fa-copy',
        version: '0.0.1',
        key: 'VIEW_RAW_DATA'
      },
      {
        name: 'Booklet',
        url: '/booklet',
        icon: 'fa fa-book',
        version: '0.0.1',
        key: 'VIEW_DEBUG'
      }
    ]
  },
  {
    name: 'Configurazione',
    url: '/config-menu',
    icon: 'fa fa-gear',
    key: ['VIEW_CONFIGURATION_GENERAL','VIEW_CONFIGURATION_ADVANCED','VIEW_CONFIGURATION_SDM_GROUP',
    'VIEW_CONFIGURATION_SDM_TICKET_STATUS','VIEW_CONFIGURATION_ROLES','VIEW_CONFIGURATION_USER_ROLES',
    'VIEW_CONFIGURATION_USER_PROFILING'],
    children: [
      {
        name: 'Generali',
        url: '/tconfiguration/general',
        icon: 'fa fa-check-circle-o',
        version: '0.0.2',
        key: 'VIEW_CONFIGURATION_GENERAL'
      },
      {
        name: 'Avanzate',
        url: '/tconfiguration/advanced',
        icon: 'fa fa-check-circle-o',
        version: '0.0.2',
        key: 'VIEW_CONFIGURATION_ADVANCED'
      },
      /*{ // maybe not needed
        name: 'Workflow',
        url: '/workflow-conf',
        icon: 'fa fa-gear',
        key: 'VIEW_WORKFLOW_CONFIGURATIONS'
      },*/
      /*{ // TEMP HIDDEN
        title: true,
        name: 'Workflow',
        key: 'VIEW_WORKFLOW_CONFIGURATIONS'
      },*/
      {
        name: 'SDM Gruppi',
        url: '/sdmgroup',
        icon: 'fa fa-gear',
        version: '0.0.1',
        key: 'VIEW_CONFIGURATION_SDM_GROUP'
      },
      {
        name: 'SDM Ticket Status',
        url: '/sdmstatus',
        icon: 'fa fa-gear',
        version: '0.0.1',
        key: 'VIEW_CONFIGURATION_SDM_TICKET_STATUS'
      },
      {
        name: 'Gestione Ruoli',
        url: '/adminroles',
        icon: 'fa fa-gear',
        version: '0.0.1',
        key: 'VIEW_CONFIGURATION_ROLES'
      },  
      {
        name: 'Ruoli Utente',
        url: '/userprofiling/rolepermissions',
        icon: 'fa fa-gear',
        version: '0.0.1',
        key: 'VIEW_CONFIGURATION_USER_ROLES' 
      }, 
      {
        name: 'Profilazione Utente',
        url: '/userprofiling/userpermissions',
        icon: 'fa fa-gear',
        version: '0.0.6',
        key: 'VIEW_CONFIGURATION_USER_PROFILING'
      }
    ]
  },
  {
    divider: true,
    key: 'alwaysShow'
  },
  {
    title: true, 
    name: 'Version 1.4.1',
    class: 'class-version-nav',
    key: 'alwaysShow'
  },
  // {
  //   name: 'Pages',
  //   url: '/pages',
  //   icon: 'icon-star',
  //   children: [
  //     {
  //       name: 'Login',
  //       url: '/login',
  //       icon: 'icon-star'
  //     },
  //     {
  //       name: 'Error 404',
  //       url: '/404',
  //       icon: 'icon-star'
  //     },
  //     {
  //       name: 'Error 500',
  //       url: '/500',
  //       icon: 'icon-star'
  //     }
  //   ]
  // },
];
