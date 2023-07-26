import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import {
  IOrderInventoryUpdate,
  ISaveOrderResponse,
} from "@/app/api/sales-orders/save-order-component";
import { IOrderComponent } from "@/types/ISales";
export interface OrderItemFormState {
  open;
  rowIndex;
  item;
  components: { [key: string]: IOrderComponent };
  updates: IOrderInventoryUpdate[];
  openCostUpdate;
  footerInfo: IFooterInfo;
  itemPriceData: {
    rowIndex;
    qty;
    price;
  };
}
export interface IFooterInfo {
  rows: {
    [name in any]: FooterRowInfo;
  };
}
export interface FooterRowInfo {
  rowIndex;
  total?;
  notTaxxed?;
}
const initialState: OrderItemFormState = {
  open: false,
  itemPriceData: null,
  footerInfo: {
    rows: {},
  },
} as any;
const orderItemComponentSlice = createSlice({
  name: "order-item-component",
  initialState,
  reducers: {
    open(state, action) {
      state.open = true;
      state.rowIndex = action.payload.rowIndex;
      state.item = action.payload.item;
      let c = state.item?.meta?.components;
      // if (c && c?.[0]?.type != "Door") {
      //   // Convert old door format
      // }
      state.components = c || {};
      state.components =
        c ||
        ([
          {
            type: "Door",
          },
          {
            type: "Frame",
          },
          {
            type: "Hinge",
          },
          {
            type: "Casing",
          },
        ] as any);
    },
    close(state, action) {
      const payload = action.payload as ISaveOrderResponse;
      state.open = false;
      state.rowIndex = null;
      state.item = null;
      state.components = {};
      state.updates = payload?.updates;
      state.openCostUpdate = state.updates?.length > 0;
      console.log("CLOSED");
    },
    closeCostUpdater(state, action) {
      state.openCostUpdate = false;
      state.updates = [];
    },
    itemQuoteUpdated(state, action) {
      state.itemPriceData = action.payload;
    },
    updateFooterInfo(state, action: PayloadAction<FooterRowInfo>) {
      let { rowIndex } = action.payload;

      const oldData = state.footerInfo.rows[rowIndex] ?? {};
      state.footerInfo.rows[rowIndex] = {
        ...oldData,
        ...action.payload,
      };
    },
  },
});
export default orderItemComponentSlice.reducer;
export const {
  open: openItemComponent,
  close: closeItemComponent,
  updateFooterInfo,
  itemQuoteUpdated,
  closeCostUpdater,
} = orderItemComponentSlice.actions;
