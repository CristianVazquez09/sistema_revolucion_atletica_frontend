import { Injectable } from '@angular/core';
import { GenericService } from './generic-service';
import { SocioData } from '../model/socio-data';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SocioService extends GenericService<SocioData> {

  constructor(protected override http: HttpClient){
    super(http, `${environment.HOST}/socios`)
  }

}
