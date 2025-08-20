import { Producto } from "../pages/producto/producto";
import { VentaData } from "./venta-data";

export interface DetalleVentaData {

    idDetalle: number;
    venta: VentaData;
    producto: Producto;
    cantidad: number;
    suTotal: number;
    
}