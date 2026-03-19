/** Standard API success response wrapper */
export interface ApiResponse<T> {
  success: true;
  data: T;
  message?: string;
}

/** Standard API error response */
export interface ApiError {
  success: false;
  error: string;
  code: string;
  details?: unknown;
  statusCode: number;
}

/** Paginated list response using cursor-based pagination */
export interface PaginatedResponse<T> {
  success: true;
  data: T[];
  pagination: {
    total: number;
    limit: number;
    /** Cursor for the next page (null when on the last page) */
    nextCursor: string | null;
    /** Cursor for the previous page */
    prevCursor: string | null;
    hasMore: boolean;
  };
}

/** Union of all API response shapes */
export type AnyApiResponse<T> = ApiResponse<T> | ApiError | PaginatedResponse<T>;
