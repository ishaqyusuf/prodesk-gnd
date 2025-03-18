"use server";

import { authId } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";

export async function checkSiteActionNotificationAction(event) {
    const userId = await authId();
    const s = await prisma.siteActionNotification.findFirst({
        where: {
            event,
            OR: [
                {
                    custom: false,
                    enabled: true,
                },
                {
                    custom: true,
                    enabled: true,
                    activeUsers: {
                        some: {
                            userId,
                        },
                    },
                },
            ],
        },
    });
    return !!s;
}
