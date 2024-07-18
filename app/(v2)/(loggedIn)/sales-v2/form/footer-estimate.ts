import { formatMoney } from "@/lib/use-number";
import { DykeForm } from "../type";
import { sum } from "@/lib/utils";

interface Props {
    footerPrices;
    laborCost;
    cccPercentage;
    paymentOption;
    discount;
    orderTax;
}
export function calculateFooterEstimate(data: DykeForm, args: Props) {
    if (!args) {
        args = {
            footerPrices: data.footer.footerPrices,
            laborCost: data.order.meta.labor_cost,
            cccPercentage: data.order.meta.ccc_percentage,
            paymentOption: data.order.meta.payment_option,
            discount: data.order.meta.discount,
            orderTax: data.order.meta.tax,
        };
    }
    const {
        footerPrices,
        laborCost,
        cccPercentage,
        paymentOption,
        discount,
        orderTax,
    } = args;
    let footr = data.footer.footerPricesJson;
    footr = JSON.parse(footerPrices);
    const taxPercentage = data.order.taxPercentage;

    const items = data.itemArray;
    let subTotal = 0;
    let tax = 0;
    let taxxable = 0;
    function calculate(uid) {
        let f = footr[uid];
        if (!f) return;
        if (!f.price) f.price = 0;

        subTotal += f.price;
        if (
            taxPercentage &&
            (f?.tax || f?.doorType != "Services") &&
            orderTax
        ) {
            const iTax = ((taxPercentage || 0) / 100) * f.price;
            tax += iTax;
            taxxable += f.price;
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
