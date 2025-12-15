export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  pageNo: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  pageNo: number;
  pageSize: number;
  searchText?: string;
}
