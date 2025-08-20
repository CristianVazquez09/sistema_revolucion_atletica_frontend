import { CategoriaData } from "./categoria-data";

export interface ProductoData {
  idProducto?: number;
  nombre: String;
  codigo: String;
  precioCompra: number;
  precioVenta: number;
  cantidad: number;
  categoria: CategoriaData;
}