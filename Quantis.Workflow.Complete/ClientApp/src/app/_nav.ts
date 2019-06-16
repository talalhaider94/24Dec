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
        icon: 'fa fa-th-list'
      },
      {
        name: 'Contratti',
        url: '/coming-soon',
        icon: 'fa fa-file-text'
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
        icon: 'fa fa-file-text-o'
      },
      {
        name: 'Ricerca',
        url: '/coming-soon',
        icon: 'fa fa-search'
      },
    ]
  },
  {
    name: 'Catalogo',
    url: '/catalogo',
    icon: 'fa fa-folder-open-o',
    children: [
      {
        name: 'Admin Utenti',
        url: '/catalogo/admin-utenti',
        icon: 'fa fa-address-book-o'
      },
      {
        name: 'Catalogo KPI',
        url: '/catalogo/kpi',
        icon: 'fa fa-file-archive-o'
      },
      {
        name: 'Catalogo Utenti',
        url: '/catalogo/utenti',
        icon: 'fa fa-address-book-o'
      },
    ]
  },
  {
    name: 'Report',
    url: '/coming-soon',
    icon: 'fa fa-files-o',
    children: [
      {
        name: 'WorkFlow Reminder',
        url: '/coming-soon',
        icon: 'fa fa-check-circle-o'
      }
    ]
  },
  {
    name: 'KPI Archiviati',
    url: '/archivedkpi',
    icon: 'fa fa-archive'
  },
  {
    name: 'Loading Form',
    url: '/coming-soon',
    icon: 'fa fa-pencil-square-o',
    children: [
      {
        name: 'Admin',
        url: '/loading-form/admin',
        icon: 'fa fa-user-circle'
      },
      {
        name: 'Utente',
        url: '/loading-form/utente',
        icon: 'fa fa-user-circle-o'
      },
    ]
  },
  {
    name: 'Configurations',
    url: '/tconfiguration',
    icon: 'fa fa-gear'
  },
  {
    divider: true
  },
  {
    title: true,
    name: 'Version 1.0.1',
    class: 'class-version-nav',
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
