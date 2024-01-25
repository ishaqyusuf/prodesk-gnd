import { UseFormReturn } from "react-hook-form";
import { DykeForm } from "../type";
import { formatMoney, toFixed } from "@/lib/use-number";

export function calculateSalesEstimate(data: DykeForm) {
    // const data = form.getValues();
    console.log(data);
    data.order.grandTotal = data.order.subTotal = data.order.tax = 0;
    data.order.taxPercentage = +(data.order.taxPercentage || 0);
    data.itemArray.map((item) => {
        item.item.rate = item.item.price = item.item.qty = item.item.total = 0;
        calculateHousePackageTool(item);
        calculateShelfItems(item);

        taxEstimateAndUpdateTotal(item, data);
        // item = res.item;
        // (data.order as any).subTotal += res.totalPrice;

        return item;
    });
    // form.reset(data);
    // console.log(data);
    return data;
}
function taxEstimateAndUpdateTotal(
    item: DykeForm["itemArray"][0],
    formData: DykeForm
) {
    const totalPrice = item.item.total || 0;

    (formData.order as any).subTotal += totalPrice;
    let tax = 0;
    if (formData.order.taxPercentage && totalPrice) {
        tax = formatMoney(totalPrice * (formData.order.taxPercentage / 100));
    }
    item.item.tax = tax;
    (formData.order as any).tax += tax;
}
function calculateShelfItems(item: DykeForm["itemArray"][0]) {
    if (item.item.meta.doorType == "Shelf Item") {
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
function calculateHousePackageTool(item: DykeForm["itemArray"][0]) {
    let packageTool = item.item.meta.housePackageTool;
    let sum = {
        doors: 0,
        unitPrice: 0,
        totalPrice: 0,
        tax: 0,
    };
    if (item.item.meta.doorType != "Shelf Item") {
        Object.entries(packageTool?.doors || {}).map(([k, v]) => {
            let doors = v.leftHand + v.rightHand;
            let unitPrice = formatMoney(
                Object.values(v.prices).reduce((a, b) => a + b, 0)
            );
            let sumTotal = 0;
            if (doors && unitPrice) {
                sumTotal = formatMoney(doors * unitPrice);
                sum.doors += doors;
                sum.unitPrice += unitPrice;
                sum.totalPrice += sumTotal;
            }
            (packageTool.doors[k] as any).unitPrice = unitPrice;
            (packageTool.doors[k] as any).sumTotal = sumTotal;
        });
        packageTool.totalPrice = sum.totalPrice;
        packageTool.totalDoors = sum.doors;
        item.item.rate = item.item.price = item.item.total = sum.totalPrice;
        item.item.qty = 1;
    }
    return { item, totalPrice: sum.totalPrice };
}