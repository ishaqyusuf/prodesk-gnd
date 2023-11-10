"use server";

import { _revalidate } from "../_revalidate";

export async function _mergeDuplicationAction(ids) {
    //

    _revalidate("customers");
}
