export interface PaginationOptions {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 1 | -1;
  status?: string;
  genre?: string;
  store?: string;
  startDate?: string;
  endDate?: string;
  minRating?: number;
  maxRating?: number;
  year?: number;
  director?: string;
  creator?: string;
  author?: string;
  format?: string;
  publisher?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
}
