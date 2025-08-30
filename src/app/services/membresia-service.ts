import { Injectable } from '@angular/core';
import { GenericService } from './generic-service';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { MembresiaData } from '../model/membresia-data';
import { PagedResponse } from '../model/paged-response';

@Injectable({
  providedIn: 'root'
})
export class MembresiaService extends GenericService<MembresiaData> {

  constructor(protected override http: HttpClient){
    super(http, `${environment.HOST}/membresias`)
  }

  buscarMemebresiaPorSocio(idSocio: number,page: number, size:number){
    return this.http.get<PagedResponse<MembresiaData>>(`${this.url}/buscar/socio/${idSocio}?page=${page}&size=${size}`);
  }

  buscarMembresiasVigentesPorSocio(idSocio: number){
    return this.http.get<MembresiaData[]>(`${this.url}/por-socio/${idSocio}/vigentes`);
  }
  
}
