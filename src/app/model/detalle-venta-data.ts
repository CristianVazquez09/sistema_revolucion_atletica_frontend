import { Producto } from '../pages/producto/producto';
import { ProductoData } from './producto-data';
import { VentaData } from './venta-data';

export interface DetalleVentaData {
  idDetalle?: number;
  producto: ProductoData;
  cantidad: number;
  subTotal: number;
}
