"use server";

import { user } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";

// export async function

export async function checkUpdateRequiredStatus() {
    const auth = await user();
    if (!auth) throw new Error();
    return auth;
}

export async function updateAccountInfoAction(data) {
    await prisma.users.update({
        where: {
            id: data.id,
        },
        data: {
            email: data.email,
            phoneNo: data.phoneNo,
            name: data.name,
        },
    });
}
