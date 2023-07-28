export type ActionResponse<T> = Promise<{
  data: T[];
  pageInfo: {
    pageIndex?: number | undefined;
    pageCount?: number | undefined;
    totalItems?: number | undefined;
    hasPreviousPage?: Boolean;
  };
}>;
