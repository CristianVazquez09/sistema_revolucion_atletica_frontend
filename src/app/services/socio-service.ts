import { Injectable } from '@angular/core';
import { GenericService } from './generic-service';
import { SocioData } from '../model/socio-data';
import { PagedResponse } from '../model/paged-response';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SocioService extends GenericService<SocioData> {

  constructor(protected override http: HttpClient){
    super(http, `${environment.HOST}/socios`)
  }


  buscarSocios(page: number, size:number){
    return this.http.get<PagedResponse<SocioData>>(`${this.url}/buscar?page=${page}&size=${size}`);
  }

  buscarSociosPorNombre(nombre: string,page: number, size:number){
    return this.http.get<PagedResponse<SocioData>>(`${this.url}/buscar/${nombre}?page=${page}&size=${size}`);
  }
  
  
}
