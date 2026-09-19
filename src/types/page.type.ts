export type Pageable<T> = {
  data: Array<T>;
  paging: Paging;
};

export interface Paging {
  current_page: number;
  total_page: number;
  size: number;
  total_item: number;
}
