import { Injectable } from '@angular/core';
import { GenericService } from './generic-service';
import { SocioData } from '../model/socio-data';
import { PagedResponse } from '../model/paged-response';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocioService extends GenericService<SocioData> {

  constructor(protected override http: HttpClient){
    super(http, `${environment.HOST}/socios`)
  }


  buscarSocios(pagina: number, tamanio: number): Observable<PagedResponse<SocioData>>{
    return this.http.get<PagedResponse<SocioData>>(`${this.url}/buscar?page=${pagina}&size=${tamanio}`);
  }

  buscarSociosPorNombre(nombre: string, pagina: number, tamanio: number): Observable<PagedResponse<SocioData>>{
    return this.http.get<PagedResponse<SocioData>>(`${this.url}/buscar/${nombre}?page=${pagina}&size=${tamanio}`);
  }
  
  
}
