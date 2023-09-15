export function searchQuery<T>(query, ...columns: (keyof T)[]) {
  if (!query._q) return {};
  const q = {
    contains: query._q || undefined,
  };
  const OR: any = [];
  columns.map((c) => {
    OR.push({
      [c]: q,
    });
  });
  return {
    OR,
  };
}
export function whereQuery<T>(query) {
  const where: any = {} as any;
  const q = {
    contains: query._q || undefined,
  };
  return {
    get: () => where as any,
    register(column: keyof T, value: any) {
      where[column] = value || undefined;
    },
    searchRelationQuery: <T1>(...columns: (keyof T)[]) => {
      Object.entries(searchQuery<T>(query, ...columns)).map(
        ([k, v]) => (where[k] = v)
      );
    },
    q,
    search(_search: T) {
      if (q.contains) {
        if (!where.OR) where.OR = [];
        Object.entries(_search as any).map(([k, v]) => {
          where.OR.push({
            [k]: v,
          });
        });
      }
    },
    searchQuery: (...columns: (keyof T)[]) => {
      Object.entries(searchQuery<T>(query, ...columns)).map(
        ([k, v]) => (where[k] = v)
      );
    },
  };
}
