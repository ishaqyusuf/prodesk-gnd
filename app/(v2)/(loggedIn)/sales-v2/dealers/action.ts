"use server";

import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import { sendMessage } from "@/app/(v1)/_actions/email";
import { userId } from "@/app/(v1)/_actions/utils";
import { paginatedAction } from "@/app/_actions/get-action-utils";
import { prisma } from "@/db";
import { generateRandomString } from "@/lib/utils";
import { Prisma } from "@prisma/client";
import dayjs from "dayjs";

interface GetDealersQuery {
    status;
}
export type DealerStatus =
    | "Verified"
    | "Approved"
    | "Pending Approval"
    | "Rejected"
    | "Restricted";
export type GetDealersPageTabAction = Awaited<
    ReturnType<typeof getDealersPageTabAction>
>;
export type GetDealersAction = Awaited<ReturnType<typeof getDealersAction>>;
export async function getDealersAction(query: GetDealersQuery) {
    const where = _where(query);
    const { pageCount, skip, take } = await paginatedAction(
        query,
        prisma.dealerAuth,
        where
    );
    const data = await prisma.dealerAuth.findMany({
        where,
        include: {
            dealer: true,
            primaryBillingAddress: true,
            token: {
                where: {
                    consumedAt: null,
                    expiredAt: {
                        lt: new Date(),
                    },
                },
            },
        },
    });
    return {
        data: data.map((data) => {
            let status = data.status as DealerStatus;
            let tokenExpired = status == "Approved" && data.token.length;
            return {
                ...data,
                status,
                tokenExpired,
            };
        }),
        pageCount,
    };
}
export async function getDealersPageTabAction() {
    const s = await prisma.dealerAuth.findMany({
        select: {
            status: true,
        },
    });
    let tabNames: DealerStatus[] = [
        "Approved",
        "Pending Approval",
        "Rejected",
        "Restricted",
    ];
    let tabs = tabNames.map((t) => {
        let count = s.filter((s) => {
            let currentStatus = s.status;
            if (!currentStatus && t == "Pending Approval") return true;
            return currentStatus == t;
        }).length;
        let params = {};
        switch (t) {
            case "Approved":
                break;
            default:
                params = {
                    qk: "status",
                    qv: t,
                };
        }
        return {
            title: t == "Approved" ? "Dealers" : t,
            count,
            params,
        };
    });
    return tabs;
}
function _where(query: GetDealersQuery) {
    const where: Prisma.DealerAuthWhereInput = {
        status: query.status || {
            in: ["Approved", "Verified"] as DealerStatus[],
        },
    };
    return where;
}
export async function resendApprovalTokenAction(id) {
    await prisma.dealerAuth.update({
        where: { id },
        data: {
            token: {
                create: {
                    token: generateRandomString(16),
                    expiredAt: dayjs().add(4, "hours").toISOString(),
                },
            },
        },
    });
    _revalidate("dealers");
}
export async function dealershipApprovalAction(
    id,
    status: DealerStatus,
    reason?: string
) {
    const authId = await userId();
    await prisma.dealerAuth.update({
        where: { id },
        data: {
            status,
            statusHistory: {
                create: {
                    status,
                    reason,
                    author: {
                        connect: {
                            id: authId,
                        },
                    },
                },
            },
            token:
                status == "Approved"
                    ? {
                          create: {
                              token: generateRandomString(16),
                              expiredAt: dayjs().add(4, "hours").toISOString(),
                          },
                      }
                    : undefined,
        },
    });
    _revalidate("dealers");
}
export async function updateDealerProfileAction(id, profileId) {
    await prisma.dealerAuth.update({
        where: { id },
        data: {
            dealer: {
                update: {
                    customerTypeId: profileId,
                },
            },
        },
    });
}
export async function sendDealerApprovalEmail(id) {
    const dealer = await prisma.dealerAuth.findFirst({
        where: { id },
        include: {
            dealer: true,
            token: true,
        },
    });
    const token = dealer.token.filter((s) => !s.consumedAt && !s.expiredAt)[0]
        ?.token;
    await sendMessage({
        subject: `Dealership Approved`,
        body: `https://localhost:3000/dealer/create-password/${token}`,
        from: `Ishaq Yusuf From GND Millwork<ishaqyusuf@gndprodesk.com>`,
    } as any);
}
