import { getCustomerProfilesList } from "@/app/_actions/hrm";
import { store } from "..";
import { updateSlice } from "../slicers";

export async function loadCustomerProfiles() {
  //  if (state.profiles.length == 0)
  const data = await getCustomerProfilesList();
  //   store.profiles = data;
  console.log(data);
  //   store.dispatch(loadCustomerProfiles(data));
  updateSlice({
    key: "customerProfiles",
    data,
  });
}
