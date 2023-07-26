import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface INav {
  link?;
  title;
}
const initialState: {
  navs: INav[];
} = {
  navs: [],
};
const headerNavSlice = createSlice({
  name: "header-nav-slice",
  initialState,
  reducers: {
    clearNav(state) {
      state.navs = [];
    },
    setNav(state, action: PayloadAction<INav[]>) {
      state.navs = action.payload;
    },
  },
});
export default headerNavSlice.reducer;
export const { clearNav, setNav } = headerNavSlice.actions;
