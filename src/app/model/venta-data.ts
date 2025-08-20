import { TipoPago } from "../util/enums/TipoPago  ";
import { DetalleVentaData } from "./detalle-venta-data";

export interface VentaData {
    idVenta: number;
    fecha: Date;
    total: number;
    tipoPago: TipoPago;
    detalles: DetalleVentaData;


}