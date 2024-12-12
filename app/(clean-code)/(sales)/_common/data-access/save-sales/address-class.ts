import { isEqual } from "lodash";
import { SaveSalesClass } from "./save-sales-class";
import { Prisma } from "@prisma/client";
import { prisma } from "@/db";
export class AddressClass {
    constructor(public ctx: SaveSalesClass) {}

    public async saveAddress() {
        const data = this.checkAddressUpdate();
        if (data) {
            const { billing, shipping, samesAddress, customer } = data;
            const customerData: Prisma.CustomersCreateManyInput = {
                name: billing.name,
                businessName: customer.businessName,
                phoneNo: billing.primaryPhone,
                phoneNo2: billing.secondaryPhone,
                email: billing.email,
            };
            Object.entries(customerData).map(([k, v]) => {
                if (!v) delete customerData[k];
            });
            // const _customer = await prisma.customers.upsert({
            //     where: {
            //         phoneNo: customerData.phoneNo,
            //     },
            //     create: customerData,
            //     update: customerData,
            // });
            //
        }
    }
    public checkAddressUpdate() {
        const oldForm = this.ctx.oldFormState.metaData;
        const form = this.ctx.form.metaData;
        const { billing, shipping, samesAddress, customer } = form;
        if (
            !isEqual(
                {
                    billing,
                    shipping,
                    samesAddress,
                    customer,
                },
                {
                    billing: oldForm.billing,
                    shipping: oldForm.shipping,
                    samesAddress: oldForm.samesAddress,
                    customer: oldForm.customer,
                }
            )
        ) {
            return { billing, shipping, samesAddress, customer };
        }
        return null;
        // const billing = form.metaData.billing;
        // const shipping = form.metaData.shipping;
    }
}
