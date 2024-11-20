import { prisma } from "@/db";
import { SalesPaymentStatus, SalesPaymentType, SalesType } from "../../types";
import { formatDate } from "@/lib/use-day";
import { whereNotTrashed } from "@/app/(clean-code)/_common/utils/db-utils";
import { userId } from "@/app/(v1)/_actions/utils";
import { getSquareDevices } from "@/modules/square";

export async function getSalesPaymentDta(id) {
    const order = await prisma.salesOrders.findFirstOrThrow({
        where: {
            type: "order" as SalesType,
            id,
        },
        select: {
            paymentDueDate: true,
            amountDue: true,
            payments: {
                ...whereNotTrashed,
                select: {
                    amount: true,
                    status: true,
                    createdAt: true,
                    id: true,
                    checkout: {
                        select: {
                            id: true,
                        },
                    },
                    commissions: {
                        select: {
                            amount: true,
                        },
                    },
                },
            },
        },
    });
    return {
        ...order,
        payments: order.payments.map((p) => {
            return {
                ...p,
                date: formatDate(p.createdAt),
            };
        }),
    };
}
export async function getPaymentTerminalsDta() {
    const devices = await getSquareDevices();
    const lastPayment = await prisma.salesCheckout.findFirst({
        where: {
            terminalId: {
                in: devices.map((d) => d.value),
            },
            userId: await userId(),
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    return {
        devices,
        lastUsed: devices.find((d) => d.value == lastPayment?.terminalId),
    };
}
export interface CreateSalesPaymentProps {
    amount;
    paymentType: SalesPaymentType;
    status?: SalesPaymentStatus;
    terminalId?: string;
    email?: string;
    phone?: string;
    orderId;
}
export async function createSalesPaymentDta({
    amount,
    paymentType,
    status,
    terminalId,
    orderId,
    email,
    phone,
}: CreateSalesPaymentProps) {
    status = "created";
    const checkout = await prisma.salesCheckout.create({
        data: {
            amount: Number(amount),
            paymentType,
            status,
            userId: await userId(),
            terminalId,
            orderId,
            meta: { email, phone },
        },
    });
    return {
        id: checkout.id,
    };
}
export async function squareSalesPaymentCreatedDta(
    id,
    paymentId,
    squareOrderId
) {
    const result = await prisma.salesCheckout.update({
        where: { id },
        data: {
            status: "pending" as SalesPaymentStatus,
            paymentId,
            meta: {
                squareOrderId,
            },
        },
    });
    return result;
}
