import { Injectable } from '@angular/core';
import { GenericService } from './generic-service';

import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { MembresiaData } from '../model/membresia-data';

@Injectable({
  providedIn: 'root'
})
export class MembresiaService extends GenericService<MembresiaData> {

  constructor(protected override http: HttpClient){
    super(http, `${environment.HOST}/membresias`)
  }
}
