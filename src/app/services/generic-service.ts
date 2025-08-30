import { HttpClient, HttpHandler, HttpHeaders } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from 'rxjs';


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

  guardar(t: T): Observable<T> {
    return this.http.post<T>(this.url, t);
  }

  actualizar(id: number, t: T): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, t);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
  
}
