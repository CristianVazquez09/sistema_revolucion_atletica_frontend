// src/app/model/paged-response.ts
export interface PageInfo {
  size: number; // page size
  number: number; // current page, 0-based
  totalElements: number;
  totalPages: number;
}

export interface PagedResponse<T> {
  content: T[];
  page?: PageInfo;
}

