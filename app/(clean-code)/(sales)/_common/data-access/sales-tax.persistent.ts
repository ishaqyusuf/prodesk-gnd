import { DykeForm } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { prisma } from "@/db";
import { withDeleted } from "@/app/(clean-code)/_common/utils/db-utils";
import { SalesTaxes, Taxes } from "@prisma/client";
import { generateRandomString, sum } from "@/lib/utils";

export async function saveSalesTaxDta(data: DykeForm, salesId) {
    const taxForm = data._taxForm;
    const taxList = Object.values(taxForm.taxByCode);
    const selectTaxes = taxList.filter((s) => s.selected);
    // const removedTaxesId = taxList
    //     .filter((t) => !t.selected && t?.data?.id)
    //     .map((t) => t.data.id);
    // if (removedTaxesId.length)
    // await prisma.salesTaxes.updateMany({
    //     where: {
    //         OR: [
    //             {
    //                 id: { in: removedTaxesId },
    //             },
    //             {
    //                 taxCode: {
    //                     in: ["A", "B"],
    //                 },
    //             },
    //             {
    //                 taxConfig: {
    //                     is: null,
    //                 },
    //             },
    //         ],
    //     },
    //     data: {
    //         deletedAt: new Date(),
    //     },
    // });
    const updateTaxList = selectTaxes.filter((s) => s.data.id);
    const newTaxList = selectTaxes.filter((t) => !t.data?.id);
    await Promise.all(
        updateTaxList.map(async (tax) => {
            await prisma.salesTaxes.update({
                where: { id: tax.data.id },
                data: {
                    deletedAt: null,
                    tax: tax.data.tax,
                    taxxable: tax.data.taxxable,
                },
            });
        })
    );
    let newTaxes = newTaxList
        .map((s) => s.data)
        .map((data) => ({
            ...data,
            salesId,
        }));
    if (newTaxes.length)
        await prisma.salesTaxes.createMany({ data: newTaxes as any });
    // const taxes = Object.values(data.taxByCode);

    // await prisma.salesTaxes.createMany({
    //     data: taxes
    //         .filter((t) => !t.id)
    //         .map((t) => ({
    //             salesId,
    //             taxCode: t.taxCode,
    //             taxxable: t.taxxable ?? 0,
    //             tax: t.tax,
    //         })),
    // });
    // await Promise.all(
    //     taxes
    //         .filter((t) => t.id)
    //         .map(async (tax) => {
    //             await prisma.salesTaxes.update({
    //                 where: { id: tax.id },
    //                 data: {
    //                     salesId,
    //                     taxCode: tax.taxCode,
    //                     taxxable: tax.taxxable ?? 0,
    //                     tax: tax.tax,
    //                 },
    //             });
    //         })
    // );
}

export async function getTaxList() {
    return await prisma.taxes.findMany({});
}
export async function getWithDeletedTaxList() {
    return await prisma.taxes.findMany({
        where: withDeleted,
    });
}
export async function createSalesTax(tax: Taxes) {
    return await prisma.taxes.create({
        data: {
            ...tax,
            taxCode: generateRandomString(4),
            taxOn: "total",
        },
    });
}
export async function salesTaxForm(taxes: SalesTaxes[], orderId?, taxCode?) {
    const taxList = await getWithDeletedTaxList();
    const taxByCode: {
        [code in string]: {
            data: Partial<SalesTaxes>;
            selected: Boolean;
            _tax: Taxes;
        };
    } = {};
    const taxCodes = taxList.map((t) => t.taxCode);
    const selection: (Pick<SalesTaxes, "taxCode" | "tax" | "deletedAt"> & {
        title: string;
        percentage;
    })[] = [];
    const taxCostsByCode: { [code in string]: number } = {};
    // console.log(taxList);

    taxList.map((tl) => {
        const tx = taxes.find((t) => t.taxCode == tl.taxCode);
        const isDefault = !orderId && tl.taxCode == taxCode;
        if (tx || !tl.deletedAt || isDefault) {
            const selected = tx != null || isDefault;
            // console.log({ selected, t: tl.title });

            taxByCode[tl.taxCode] = {
                selected,
                _tax: tl,
                data:
                    tx ||
                    ({
                        taxCode: tl.taxCode,
                    } as any),
            };
            if (selected || isDefault) {
                selection.push({
                    tax: tx?.tax,
                    taxCode: tl?.taxCode,
                    deletedAt: tx?.deletedAt,
                    title: tl.title,
                    percentage: tl.percentage,
                });
                taxCostsByCode[tl.taxCode] = tx?.tax;
            }
        }
    });

    return {
        taxList: taxList.filter((l) => !l.deletedAt),
        taxCodes,
        selection,
        taxByCode,
        taxCostsByCode,
        totalTax: sum(selection, "tax"),
        taxChangedCode: generateRandomString(10),
    };
}
