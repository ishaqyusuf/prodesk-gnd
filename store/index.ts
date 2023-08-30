import { configureStore } from "@reduxjs/toolkit";
// import orderFormSlice from "./orderFormSlice";
import type { TypedUseSelectorHook } from "react-redux";
import { useSelector } from "react-redux";
import orderItemComponentSlice from "./invoice-item-component-slice";
// importCustomerTypes from "./customerProfiles";
// import headerSlice from "./headerNavSlice";
import slicers from "./slicers";

export const store = configureStore({
  reducer: {
    // orderForm: orderFormSlice,
    //CustomerTypes,
    orderItemComponent: orderItemComponentSlice,
    // headerSlice,
    slicers,
  },
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware();
  },
});
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
