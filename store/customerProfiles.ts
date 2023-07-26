import { createSlice } from "@reduxjs/toolkit";

import { CustomerTypes } from "@prisma/client";
import getProfilesList from "@/app/api/sales-customers/api.profilesList";
import { store } from ".";

const initialState: {
  profiles: CustomerTypes[];
} = {
  profiles: [],
} as any;
const customerProfiles = createSlice({
  name: "order-form",
  initialState,
  reducers: {
    initializeCtx(state, action) {
      //   Object.entries(action.payload).map(([k, v]) => (state[k] = v));
    },
    load(state, action) {
      state.profiles = action.payload;
      //   console.log("LOAD");
      //   state.invoiceLength += action.payload;
    },
  },
});
export default customerProfiles.reducer;
export const { load: loadCustomerProfiles } = customerProfiles.actions;
export async function loadProfiles() {
  //  if (state.profiles.length == 0)
  const data = await getProfilesList();
  //   store.profiles = data;
  console.log(data);
  store.dispatch(loadCustomerProfiles(data));
}
