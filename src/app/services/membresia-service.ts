import { Injectable } from '@angular/core';
import { GenericService } from './generic-service';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { MembresiaData } from '../model/membresia-data';
import { PagedResponse } from '../model/paged-response';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MembresiaService extends GenericService<MembresiaData> {

  constructor(protected override http: HttpClient){
    super(http, `${environment.HOST}/membresias`)
  }

  buscarMembresiasPorSocio(idSocio: number, pagina: number, tamanio: number): Observable<PagedResponse<MembresiaData>>{
    return this.http.get<PagedResponse<MembresiaData>>(`${this.url}/buscar/socio/${idSocio}?page=${pagina}&size=${tamanio}`);
  }

  buscarMembresiasVigentesPorSocio(idSocio: number): Observable<MembresiaData[]>{
    return this.http.get<MembresiaData[]>(`${this.url}/por-socio/${idSocio}/vigentes`);
  }
  
}
