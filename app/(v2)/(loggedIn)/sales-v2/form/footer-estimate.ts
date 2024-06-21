import { formatMoney } from "@/lib/use-number";
import { DykeForm } from "../type";
import { sum } from "@/lib/utils";

interface Props {
    footerPrices;
    laborCost;
    cccPercentage;
    paymentOption;
    discount;
}
export function calculateFooterEstimate(data: DykeForm, args: Props) {
    if (!args) {
        args = {
            footerPrices: data.footer.footerPrices,
            laborCost: data.order.meta.labor_cost,
            cccPercentage: data.order.meta.ccc_percentage,
            paymentOption: data.order.meta.payment_option,
            discount: data.order.meta.discount,
        };
    }
    const { footerPrices, laborCost, cccPercentage, paymentOption, discount } =
        args;
    let footr = data.footer.footerPricesJson;
    footr = JSON.parse(footerPrices);
    const orderTax = data.order.tax;
    const taxPercentage = data.order.taxPercentage;
    console.log(footr);

    // console.log(footr);
    const items = data.itemArray;
    let subTotal = 0;
    let tax = 0;
    let taxxable = 0;
    function calculate(uid) {
        let f = footr[uid];
        console.log("RAW:", data._rawData.footer.footerPricesJson[uid]);
        console.log(uid, f);
        if (!f) return;
        if (!f.price) f.price = 0;
        console.log(data._rawData.taxPercentage);

        subTotal += f.price;
        if (taxPercentage && (f?.tax || f?.doorType != "Services")) {
            const iTax = ((taxPercentage || 0) / 100) * f.price;
            tax += iTax; //f?.price || 0;
            taxxable += f.price;
            // console.log(tax)
        }
    }
    items.map((item) => {
        if (item.multiComponent)
            Object.values(item.multiComponent.components)
                .filter(Boolean)
                .filter((c) => (c as any).checked)
                .map((v) => {
                    // console.log(v.uid);
                    calculate(v.uid);
                });

        // if(item.item.shelfItemArray)
        item.item.shelfItemArray?.map((shelfItem) => {
            calculate(shelfItem.uid);
        });
    });
    tax = formatMoney(tax);

    let total = formatMoney(sum([subTotal, laborCost]));
    let ccc = 0;
    const cccP = Number(cccPercentage || 0);
    // console.log(cccP);

    if (paymentOption == "Credit Card") {
        // console.log(cccP);

        ccc = formatMoney((cccP / 100) * (total + tax));
        // console.log(ccc, [total + tax]);
    }
    const grandTotal = formatMoney(tax + ccc + total - (discount || 0));
    return {
        ccc,
        grandTotal,
        total,
        subTotal,
        tax,
    };
}
