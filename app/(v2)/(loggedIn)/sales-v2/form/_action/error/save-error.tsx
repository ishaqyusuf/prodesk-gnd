"use server";

import { sendMessage } from "@/app/(v1)/_actions/email";
import { userId } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";

export async function _saveDykeError(errorId, data) {
    await prisma.dykeSalesError.create({
        data: {
            meta: data,
            errorId,
            userId: await userId(),
        },
    });
    // notify me.
    console.log("SENDING >>>>>");
    await sendMessage({
        body: `Dyke save error`,
        subject: `GND: Dyke Save Error`,
        to: `ishaqyusuf024@gmail.com`,
        from: `Noreply <pcruz321@gndprodesk.com>`,
        type: "error",
        parentId: null,
        attachOrder: false,
    } as any);
    console.log("SENT");
}
