// import { ISalesOrder, ISalesOrderItem } from "@/types/ISales";
import { deepCopy } from "@/lib/deep-copy";
import { formatDate } from "@/lib/use-day";
import { Users } from "@prisma/client";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { store } from ".";
import { IOrderPrintMode, ISalesOrder, ISalesOrderItem } from "@/types/sales";
// import { IOrderPrintMode } from "@/app/(auth)/sales/orders/components/row-action/print-order-menu";

export interface ISlicer {
  order: ISalesOrder;
  productionUsers: Users[];
  assignProduction: ISalesOrder;
  orderProdView: Boolean;
  orderTimeline: ISalesOrder;
  prodItemUpdate: {
    item: ISalesOrderItem;
    action: "Complete" | "Cancel";
  };
  applyPayment: ISalesOrder[];
  printOrders: {
    mode: IOrderPrintMode;
    slugs;
    isClient;
  };
  printUnits: string[];
  modal: {
    name: ModalName;
    data: any;
  };
}
export type ModalName = "assignProduction" | undefined;
const initialState: ISlicer = ({
  modal: {
    name: undefined,
    data: null,
  },
} as Partial<ISlicer>) as any;
const headerNavSlice = createSlice({
  name: "slicers",
  initialState,
  reducers: {
    updateSlice(state, action: PayloadAction<{ key: keyof ISlicer; data }>) {
      const { key, data } = action.payload;
      // Object.entries(data).map(([k, v]) => {
      //   // console.log(k, v);
      //   if (v instanceof Date) data[k] = formatDate(v);
      //   if (typeof v == "object") data[k] = transformObject(v);
      // });
      const d = transformObject(data);
      // console.log(d);
      state[key] = d;
    },
  },
});
function transformObject(data) {
  if (!data) return;
  // let _data = deepCopy(data)
  try {
    if (data)
      Object.entries(data).map(([k, v]) => {
        // console.log(k, v);
        if (v instanceof Date) data[k] = formatDate(v);
        else if (typeof v == "object" && v != null) {
          // console.log("OBJECT", k, v);
          // console.log(transformObject(v));
          data[k] = transformObject(v);
        }
      });
  } catch (error) {}
  // console.log(data);
  return data;
}
export default headerNavSlice.reducer;
export const { updateSlice } = headerNavSlice.actions;
export function dispatchSlice(key: keyof ISlicer, data: any = null) {
  // if (data) data = deepCopy(data);
  store.dispatch(
    updateSlice({
      key,
      data: deepCopy(data),
    })
  );
}
