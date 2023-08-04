import { getCustomerProfilesList } from "@/app/_actions/hrm";
import { store } from "..";
import { dispatchSlice, updateSlice } from "../slicers";

export async function loadCustomerProfiles() {
  //  if (state.profiles.length == 0)
  const data = await getCustomerProfilesList();
  //   store.profiles = data;

  //   store.dispatch(loadCustomerProfiles(data));
  dispatchSlice("customerProfiles", data);
}
