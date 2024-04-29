import { sum as _sum } from "@/lib/utils";
import { DykeForm } from "../type";
import { formatMoney } from "@/lib/use-number";

export function calculateSalesEstimate(data: DykeForm) {
    data.order.grandTotal = data.order.subTotal = data.order.tax = 0;
    data.order.taxPercentage = +(data.order.taxPercentage || 0);

    data.itemArray.map((item) => {
        // item.item.rate = item.item.total = 0;
        // if (item.item?.housePackageTool?.doorType == "Moulding") {
        // calculateLineItem(item);
        // } else {
        // item.item.rate =
        //     item.item.price =
        //     item.item.qty =
        //     item.item.total =
        //         0;
        // calculateHousePackageTool(item);
        calculateShelfItems(item);
        // }

        taxEstimateAndUpdateTotal(item, data);
        // console.log(item.item.total);

        // item = res.item;
        // (data.order as any).subTotal += res.totalPrice;
    });
    const {
        subTotal,
        tax,
        meta: { labor_cost = 0, discount = 0, payment_option },
    } = data.order;
    let total = formatMoney(subTotal + labor_cost + discount);
    let ccc = 0;
    const cccPercentage = Number(data.data?.settings?.ccc || 0);
    if (payment_option == "Credit Card")
        ccc += formatMoney((cccPercentage / 100) * (total + tax));
    data.order.meta.ccc = ccc;
    data.order.meta.ccc_percentage = cccPercentage;
    const dt = (data.order.grandTotal = ccc + tax + total);
    data.order.amountDue = dt - (data.paidAmount || 0);
    return data;
}
function taxEstimateAndUpdateTotal(
    item: DykeForm["itemArray"][0],
    formData: DykeForm
) {
    if (!formData.order.tax) formData.order.tax = 0;
    if (!formData.order.subTotal) formData.order.subTotal = 0;
    const totalPrice = item.item.total || 0;

    (formData.order as any).subTotal += totalPrice;
    let tax = 0;
    if (formData.order.taxPercentage && totalPrice) {
        tax = formatMoney(totalPrice * (formData.order.taxPercentage / 100));
    }
    item.item.tax = tax;
    formData.order.tax += tax;
}
function calculateShelfItems(item: DykeForm["itemArray"][0]) {
    if (item.item.shelfItemArray?.length) {
        let sum = {
            doors: 0,
            unitPrice: 0,
            totalPrice: 0,
            tax: 0,
        };
        item.item.shelfItemArray.map((shelf) => {
            shelf.productArray
                .filter((p) => p.item)
                .map((prod) => {
                    // product.item.totalPrice
                    sum.totalPrice += prod.item.totalPrice || 0;
                });
        });
        item.item.qty = 0;
        item.item.rate = item.item.price = item.item.total = sum.totalPrice;
    }
}
function calculateLineItem(item: DykeForm["itemArray"][0]) {
    const price = item.item.price || 0;
    const qty = item.item.qty || 0;
    item.item.rate = price;
    item.item.total = price * qty || 0;
}
function calculateHousePackageTool(item: DykeForm["itemArray"][0]) {
    let packageTool = item.item.housePackageTool;
    let sum = {
        doors: 0,
        unitPrice: 0,
        totalPrice: 0,
        tax: 0,
    };
    // console.log(packageTool?._doorForm);
    if (item.item.housePackageTool?.doorType) {
        // Object.entries(packageTool?._doorForm || {}).map(([k, v]) => {
        //     let doors = _sum([v?.lhQty, v?.rhQty]);
        //     const {
        //         doorPrice = 0,
        //         casingPrice = 0,
        //         jambSizePrice = 0,
        //     } = v as any;
        //     let unitPrice = formatMoney(
        //         Object.values({ doorPrice, casingPrice, jambSizePrice }).reduce(
        //             (a, b) => a + b,
        //             0
        //         )
        //     );
        //     let sumTotal = 0;
        //     if (doors && unitPrice) {
        //         sumTotal = formatMoney(doors * unitPrice);
        //         sum.doors += doors;
        //         sum.unitPrice += unitPrice;
        //         sum.totalPrice += sumTotal;
        //     }
        //     (packageTool._doorForm[k] as any).unitPrice = unitPrice;
        //     (packageTool._doorForm[k] as any).lineTotal = sumTotal;
        //     (packageTool._doorForm[k] as any).dimension = k?.replaceAll(
        //         "in",
        //         '"'
        //     );
        // });
        // packageTool.totalPrice = sum.totalPrice;
        // packageTool.totalDoors = sum.doors;
        // item.item.rate = item.item.price = item.item.total = sum.totalPrice;
        // item.item.qty = 1;
    }
    console.log(sum);

    return { item, totalPrice: item.item.total };
}
