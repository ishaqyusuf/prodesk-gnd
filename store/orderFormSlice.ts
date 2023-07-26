import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { SalesFormCtx } from "@/app/api/sales-orders/create-order-form";
import { useAppSelector } from ".";
export interface OrderFormState extends SalesFormCtx {
  inoiceLength;
}
const initialState: OrderFormState = {
  invoiceLength: 20,
} as any;
const orderFormSlice = createSlice({
  name: "order-form",
  initialState,
  reducers: {
    initializeCtx(state, action: PayloadAction<SalesFormCtx>) {
      Object.entries(action.payload).map(([k, v]) => (state[k] = v));
    },
    extendInvoiceLength(state, action) {
      //   state.invoiceLength += action.payload;
    },
  },
});
export default orderFormSlice.reducer;
export const { initializeCtx: initOrderFormCtx, extendInvoiceLength } =
  orderFormSlice.actions;
