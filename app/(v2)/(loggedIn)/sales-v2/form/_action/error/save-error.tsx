"use server";

import { sendMessage } from "@/app/(v1)/_actions/email";
import { userId } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";
import { generateRandomString } from "@/lib/utils";

export async function _saveDykeError(errorId, data) {
    await prisma.dykeSalesError.create({
        data: {
            meta: data,
            errorId: errorId || generateRandomString(4),
            userId: await userId(),
        },
    });
    // notify me.
    console.log("SENDING >>>>>");
    try {
        await sendMessage({
            body: [
                `Dyke save error`,
                "------- DATA ------",
                JSON.stringify(data),
            ]
                .filter(Boolean)
                .join("\n"),
            subject: `GND: Dyke Save Error`,
            to: `ishaqyusuf024@gmail.com`,
            from: `Noreply <pcruz321@gndprodesk.com>`,
            type: "error",
            parentId: null,
            attachOrder: false,
        } as any);
        console.log("SENT");
    } catch (error) {}
}
export async function _deleteDykeError(errorId) {
    await prisma.dykeSalesError.deleteMany({
        where: {
            errorId,
        },
    });
}
