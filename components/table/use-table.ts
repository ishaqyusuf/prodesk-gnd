"use server";
import { getOrders } from "@/app/api/sales-orders/order-api";

interface ITableIndex {
  orders?;
  productions?;
}
const useTableIndex: ITableIndex = {
  orders: getOrders,
  productions: getOrders,
};
export type ITableIndexNames = keyof ITableIndex; // "orders";
async function useTableQuery(name, query = {}) {
  const fn = useTableIndex[name];
  console.log(name);
  console.log(query);
  return fn(query);
}
export default useTableQuery;

export async function loadPageTable(searchParams, fn, _baseQuery = {}) {
  const q: any = {
    ...(searchParams || {}),
    ..._baseQuery,
  };
  Object.entries(q).map(([k, v]) => {
    const vals = (v as any)?.split(",")?.filter(Boolean);
    if (vals?.length > 1) {
      q[k] = vals;
    }
    if (vals?.length == 1) q[k] = v;
  });
  console.log(q);
  const resp = await fn(q);

  return resp;
}
