"use server";

import { AsyncFnType } from "@/types";
import { getDispatchListActions } from "./dispatch-list-action";

export type DispatchOverviewAction = AsyncFnType<typeof dispatchOverviewAction>;
export async function dispatchOverviewAction(id) {
    const listOverview = await getDispatchListActions;
}
