export interface Paginator {
  pageSize: number, // number of records per page
  pageIndex: number, // current page number (0-based)
  totalRecords: number, // total items from server
}

export const initialPaginator: Paginator = {
  pageSize: 10,
  pageIndex: 0,
  totalRecords: 0,
}

export interface Sorter {
  sortColumn: string,
  sortOrder: string,
}

export interface DropDownOptions {
  name: string, value: string
}