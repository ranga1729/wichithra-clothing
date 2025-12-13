export interface Paginator {
  pageSize: number,         // number of records per page
  pageIndex: number,         // current page number (0-based)
  totalRecords: number,      // total items from server
}