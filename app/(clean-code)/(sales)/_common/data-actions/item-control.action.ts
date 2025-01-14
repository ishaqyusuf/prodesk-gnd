"use action";

import { Prisma } from "@prisma/client";
import { itemControlUidObject } from "../utils/item-control-utils";

export async function updateItemControlAction(
    data: Prisma.SalesItemControlCreateManyInput
) {}

export async function getItemControlAction(uid) {
    const obj = itemControlUidObject(uid);
}
