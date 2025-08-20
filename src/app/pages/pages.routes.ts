import { Routes } from "@angular/router";
import { AsistenciaComponent } from "./asistencia-component/asistencia-component";

import { Socio } from "./socio/socio";
import { Inscripcion } from "./inscripcion/inscripcion";
import { Paquete } from "./paquete/paquete";
import { Producto } from "./producto/producto";
import { Categoria } from "./categoria/categoria";
import { PuntoVenta } from "./punto-venta/punto-venta";

export const pagesRoutes: Routes = [
  { path: 'paquete', component: Paquete},
  {path: 'asistencia', component: AsistenciaComponent},
  {path: 'socio', component: Socio},
  {path: 'inscripcion', component: Inscripcion},
  {path: 'inventario', component: Producto},
  {path: 'categoria', component: Categoria},
  {path: 'punto-venta', component: PuntoVenta}

];