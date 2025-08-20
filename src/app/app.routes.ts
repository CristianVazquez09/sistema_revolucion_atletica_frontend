import { Routes } from '@angular/router';
import { MenuPrincipal } from './pages/menu-principal/menu-principal';

export const routes: Routes = [
  {
    path: 'pages',
    component: MenuPrincipal,
    loadChildren: () =>
      import('./pages/pages.routes').then((x) => x.pagesRoutes),
  },
  {
    path: '',
    component: MenuPrincipal
  }
];
