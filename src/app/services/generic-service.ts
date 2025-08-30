import { HttpClient, HttpParams } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Observable } from 'rxjs';
import { PagedResponse } from '../model/paged-response';


@Injectable({
  providedIn: 'root'
})
export class GenericService <T> {

    constructor(
    protected http: HttpClient,
    @Inject("url") protected url: string
  ) { }

  buscarTodos(): Observable<T[]> {
    return this.http.get<T[]>(this.url);
  }

  buscarPorId(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  guardar(entidad: T): Observable<T> {
    return this.http.post<T>(this.url, entidad);
  }

  actualizar(id: number, entidad: T): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, entidad);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  buscar(params: HttpParams | Record<string, any>): Observable<T[]> {
    const httpParams =
      params instanceof HttpParams ? params : new HttpParams({ fromObject: params });
    return this.http.get<T[]>(`${this.url}/buscar`, { params: httpParams });
  }

  buscarPaginado(
    pagina: number,
    tamanio: number,
    params?: Record<string, any>
  ): Observable<PagedResponse<T>> {
    let httpParams = new HttpParams().set('page', pagina).set('size', tamanio);

    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          httpParams = httpParams.set(k, String(v));
        }
      });
    }

    return this.http.get<PagedResponse<T>>(`${this.url}/buscar`, { params: httpParams });
  }
  
}
