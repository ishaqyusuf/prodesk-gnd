import { getPageInfo, queryFilter } from "@/app/_actions/action-utils";

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
export async function queryBuilder<T>(query, table) {
  const where = whereQuery<T>(query);
  const queryFilters = await queryFilter(query);
  return {
    ...where,
    getWhere: where.get,
    queryFilters,
    async response(data) {
      const pageInfo = await getPageInfo(query, where.get(), table);
      return {
        pageInfo,
        data,
      };
    },
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
