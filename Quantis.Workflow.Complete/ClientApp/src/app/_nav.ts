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
  url?: string;
  icon?: string;
  badge?: NavBadge;
  title?: boolean;
  children?: NavData[];
  variant?: string;
  attributes?: NavAttributes;
  divider?: boolean;
  class?: string;
  label?: NavLabel;
  wrapper?: NavWrapper;
}

export const navItems: NavData[] = [
  {
    name: 'Dashboard',
    url: '/dashboard',
    icon: 'icon-speedometer',
    badge: {
      variant: 'info',
      text: ''
    }
  },
  {
    title: true,
    name: 'Menu',
  },
  {
    name: 'Home',
    url: '/coming-soon',
    icon: 'icon-home',
    children: [
      {
        name: 'Contraenti',
        url: '/coming-soon',
        icon: 'fa fa-circle-thin'
      },
      {
        name: 'Contratti',
        url: '/coming-soon',
        icon: 'fa fa-circle-thin'
      },
    ]
  },
  {
    name: 'Workflow',
    url: '/coming-soon',
    icon: 'fa fa-code-fork',
    children: [
      {
        name: 'KPI in Verifica',
        url: '/kpi',
        icon: 'fa fa-circle-thin'
      },
      {
        name: 'Ricerca',
        url: '/coming-soon',
        icon: 'fa fa-circle-thin'
      },
    ]
  },
  {
    name: 'Catalogo',
    url: '/catalogo',
    icon: 'icon-doc',
    children: [
      {
        name: 'Catalogo KPI',
        url: '/catalogo/kpi',
        icon: 'fa fa-circle-thin'
      },
      {
        name: 'Catalogo Utenti',
        url: '/catalogo/utenti',
        icon: 'fa fa-circle-thin'
      },
    ]
  },
  {
    name: 'Report',
    url: '/coming-soon',
    icon: 'icon-doc',
    children: [
      {
        name: 'WorkFlow Reminder',
        url: '/coming-soon',
        icon: 'fa fa-circle-thin'
      }
    ]
  },
  {
    name: 'Configurations',
    url: '/tconfiguration',
    icon: 'icon-doc'
  },
  {
    name: 'KPI Archiviati',
    url: '/archivedkpi',
    icon: 'icon-doc'
  },
  {
    name: 'Loading Form',
    url: '/coming-soon',
    icon: 'fa fa-edit',
    children: [
      {
        name: 'Admin',
        url: '/loading-form/admin',
        icon: 'fa fa-circle-thin'
      },
      {
        name: 'Utente',
        url: '/loading-form/user',
        icon: 'fa fa-circle-thin'
      },
    ]
  },
  {
    divider: true
  },
  {
    name: 'Pages',
    url: '/pages',
    icon: 'icon-star',
    children: [
      {
        name: 'Login',
        url: '/login',
        icon: 'icon-star'
      },
      {
        name: 'Error 404',
        url: '/404',
        icon: 'icon-star'
      },
      {
        name: 'Error 500',
        url: '/500',
        icon: 'icon-star'
      }
    ]
  },
];
