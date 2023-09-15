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
  const where: T = {} as any;
  return {
    where,
    register(column: keyof T, value: any) {
      where[column] = value || undefined;
    },
    searchQuery: (...columns: (keyof T)[]) => {
      Object.entries(searchQuery<T>(query, ...columns)).map(
        ([k, v]) => (where[k] = v)
      );
    },
  };
}
