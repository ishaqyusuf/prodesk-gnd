"use server";

import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import { prisma } from "@/db";
import { Customers } from "@prisma/client";

export async function mergeCustomersAction(
    { id: customerId }: Customers,
    customerIds
) {
    const duplicateIds = customerIds.filter((id) => id != customerId);

    let customer = await prisma.customers.findFirst({
        where: { id: customerId },
        include: {
            wallet: true,
        },
    });
    const wallet =
        customer?.wallet ||
        (await prisma.customerWallet.create({
            data: {
                balance: 0,
                meta: {},
                customer: {
                    connect: {
                        id: customerId,
                    },
                },
            },
        }));
    if (!customer || !wallet) throw Error();
    console.log(wallet);
    console.log(customer);
    const where = { customerId: { in: duplicateIds } };
    const update = {
        where,
        data: { customerId, updateAt: new Date() },
    };
    const getIds = async (table) => {
        return (await table.findMany({ where })).map(({ id }) => id);
    };
    const updateCustomerId = async (table) => {
        const ids = await getIds(table);
        await table.updateMany({
            where: { id: { in: ids } },
            data: { customerId, updatedAt: new Date() },
        });
    };
    await updateCustomerId(prisma.addressBooks);
    await updateCustomerId(prisma.salesOrders);
    await updateCustomerId(prisma.salesPayments);
    // await prisma.salesOrders.updateMany(update);
    // await prisma.salesPayments.updateMany(update);

    const wallets = await prisma.customerWallet.findMany({
        where: {
            customer: {
                id: { in: duplicateIds },
            },
        },
    });
    const dupWalIds = wallets.map(({ id }) => id);
    // await prisma.customerTransaction.updateMany({
    //     where: {
    //         id: { in: dupWalIds },
    //     },
    //     data: {
    //         walletId: wallet.id as any,
    //     },
    // });
    // await prisma.customerWallet
    // await prisma.customers.updateMany({
    //     where: {
    //         id: { in: duplicateIds },
    //     },
    //     data: {
    //         walletId: null,
    //     },
    // });
    let amount = 0;
    wallets.map(({ balance }) => (amount += balance || 0));
    await prisma.customerWallet.update({
        where: { id: wallet.id as any },
        data: {
            balance: {
                increment: amount,
            },
        },
    });
    await prisma.customerTransaction.deleteMany({
        where: {
            walletId: { in: dupWalIds },
        },
    });
    // await prisma.customerWallet.deleteMany({
    //     where: { id: { in: dupWalIds } },
    // });
    await prisma.customers.deleteMany({ where: { id: { in: duplicateIds } } });
    _revalidate("customers");
}
