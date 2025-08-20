import { Injectable } from '@angular/core';
import { ProductoData } from '../model/producto-data';
import { GenericService } from './generic-service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProductoService  extends GenericService<ProductoData>{

   constructor(protected override http: HttpClient){
    super(http, `${environment.HOST}/productos`,)

  }

  buscarPorCategoria(idCategoria:number){
    return this.http.get<any>(`${this.url}/buscar/${idCategoria}`);
  }

  buscarPorNombre(nombreProducto:string){
    return this.http.get<any>(`${this.url}/buscar/nombre/${nombreProducto}`);
  }
  
}
