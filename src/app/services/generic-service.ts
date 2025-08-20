import { HttpClient, HttpHandler, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";


@Injectable({
  providedIn: 'root'
})
export class GenericService <T> {

    constructor(
    protected http: HttpClient,
    @Inject("url") protected url: string
  ) { }

  buscarTodos(){
    return this.http.get<T[]>(this.url);
  }

  buscarPorId(id: number){
    return this.http.get<T>(`${this.url}/${id}`);
  }

  guardar(t: T){
    return this.http.post(this.url, t);
  }

  actualizar(id: number, t: T){
    return this.http.put(`${this.url}/${id}`, t);
  }

  eliminar(id: number){
    return this.http.delete(`${this.url}/${id}`);
  }
  
}
