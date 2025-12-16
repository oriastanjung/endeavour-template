export type PaginationWrapper<T> = {
  data?: T;
  total_pages: number;
  current_page: number;
  per_page: number;
  total_items: number;
};
