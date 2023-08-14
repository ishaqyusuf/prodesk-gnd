export type TableApiResponse<T> = Promise<{
  data: T[];
  pageInfo: {
    pageIndex?: number | undefined;
    pageCount?: number | undefined;
    totalItems?: number | undefined;
    hasPreviousPage?: Boolean;
  };
}>;
export interface BaseQuery {
  _q?;
  _dateType?;
  status?;
  date?;
  from?;
  to?;
  page?;
  per_page?;
  sort_order?;
  sort?;
}
