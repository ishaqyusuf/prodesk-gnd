import { DykeForm } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import salesData from "../utils/sales-data";
import { prisma } from "@/db";

export async function saveSalesTaxDta(data: DykeForm, salesId) {
    const taxes = Object.values(data.taxByCode);

    await prisma.salesTaxes.createMany({
        data: taxes
            .filter((t) => !t.id)
            .map((t) => ({
                salesId,
                taxCode: t.taxCode,
                taxxable: t.taxxable ?? 0,
                tax: t.tax,
            })),
    });
    await Promise.all(
        taxes
            .filter((t) => t.id)
            .map(async (tax) => {
                await prisma.salesTaxes.update({
                    where: { id: tax.id },
                    data: {
                        salesId,
                        taxCode: tax.taxCode,
                        taxxable: tax.taxxable ?? 0,
                        tax: tax.tax,
                    },
                });
            })
    );
}
