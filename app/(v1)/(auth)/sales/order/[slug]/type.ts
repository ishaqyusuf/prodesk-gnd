import { getOrderAction } from "@/app/(v1)/_actions/sales/sales";
import { PromiseType } from "@/types";

export type SalesOverview = PromiseType<typeof getOrderAction>["Response"];
