import { authId, userId } from "@/app/(v1)/_actions/utils";
import { prisma } from "@/db";
import { sum } from "@/lib/utils";
import { SalesPaymentStatus } from "../../../types";

export async function getCustomerWalletDta(accountNo) {
    const wallet = await prisma.customerWallet.upsert({
        where: {
            accountNo,
        },
        update: {},
        create: {
            balance: 0,
            accountNo,
        },
    });
    return wallet;
}
export async function fundCustomerWalletDta(accountId, amount, paymentMethod) {
    const tx = await prisma.customerTransaction.create({
        data: {
            amount,
            walletId: accountId,
            authorId: await userId(),
            paymentMethod,
            status: "success" as SalesPaymentStatus,
        },
    });
    return tx;
}
export async function applyPaymentDta(walletId, transactionIds) {
    const transactions = await prisma.salesPayments.findMany({
        where: {
            id: {
                in: transactionIds,
            },
        },
        select: {
            amount: true,
            orderId: true,
        },
    });
    const total = sum(transactions, "amount") * -1;
    const customerTx = await prisma.customerTransaction.create({
        data: {
            amount: total,
            walletId,
            authorId: await authId(),
            status: "success" as SalesPaymentStatus,
        },
    });
    await prisma.salesPayments.updateMany({
        where: {
            id: { in: transactionIds },
        },
        data: {
            transactionId: customerTx.id,
            status: "success" as SalesPaymentStatus,
        },
    });
    await Promise.all(
        transactions.map(async (tx) => {
            await prisma.salesOrders.update({
                where: { id: tx.orderId },
                data: {
                    amountDue: {
                        decrement: tx.amount,
                    },
                },
            });
        })
    );
}
