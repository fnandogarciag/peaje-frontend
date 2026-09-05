import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: 'carros', loadComponent: () => import('./pages/carros/carros.component').then(m => m.CarrosComponent) },
  { path: 'carros-mutaciones', loadComponent: () => import('./pages/carros-mutaciones/carros-mutaciones.component').then(m => m.CarrosMutacionesComponent) },
  { path: 'mutaciones', loadComponent: () => import('./pages/mutaciones/mutaciones.component').then(m => m.MutacionesComponent) },
  { path: 'tiempo', loadComponent: () => import('./pages/tiempo/tiempo.component').then(m => m.TiempoComponent) },
  { path: 'tipos', loadComponent: () => import('./pages/tipos/tipos.component').then(m => m.TiposComponent) },
  { path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent), pathMatch: 'full' }
];
