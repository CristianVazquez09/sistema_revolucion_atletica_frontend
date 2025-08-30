// src/app/model/paged-response.ts
export interface InfoPagina {
  tamanio: number; // tamaño de página
  numero: number; // página actual, base 0
  totalElementos: number;
  totalPaginas: number;
}

export interface PagedResponse<T> {
  contenido: T[];
  pagina?: InfoPagina;
}

