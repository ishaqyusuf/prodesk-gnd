import { convertToNumber, toFixed } from "@/lib/use-number";
import { ISalesSettingMeta, ISalesWizard } from "@/types/post";
import {
    IFooterInfo,
    ISalesOrderForm,
    ISalesOrderItem,
    ISalesOrderItemMeta,
    WizardKvForm
} from "@/types/sales";
import { openModal } from "../modal";
import { removeEmptyValues } from "../utils";
import { deepCopy } from "../deep-copy";

export function initInvoiceItems(items: ISalesOrderItem[] | undefined) {
    if (!items) items = [];
    const _itemsByIndex: any = {};
    let rows = 20;
    console.log(items);
    items.map(item => {
        const li = [
            item.meta?.line_index,
            item.meta?.uid,
            item.meta?.lineIndex
        ].filter(i => i >= 0)[0];
        if (li >= 0) {
            _itemsByIndex[li] = item;
            if (li > rows) rows = li;
        }
    });
    const _items = Array(rows + 1)
        .fill(null)
        .map((c, uid) => {
            const _ = generateItem(uid, _itemsByIndex[uid]);
            return _;
        });
    return _items;
}
export function generateItem(uid, baseItem: any = null) {
    if (!baseItem) baseItem = { meta: {} };
    let price = baseItem?.rate || baseItem?.price;

    const _: ISalesOrderItem = {
        ...baseItem,
        rate: null,
        price,
        meta: {
            tax: "Tax",
            sales_margin: "Default",
            ...(baseItem?.meta ?? {}),
            uid,
            lineIndex: null,
            line_index: null
        }
    } as any;
    // if (_.id) _.meta.tax = (_.tax || 0) > 0 ? "Tax" : "Non";
    return _;
}
export function moreInvoiceLines(fields: ISalesOrderItem[]) {
    const baseUID = fields.length;
    Array(5)
        .fill(null)
        .map((c, uid) => {
            fields.push(generateItem(uid + baseUID));
        });
    return fields;
}
export function addLine(toIndex, fields: ISalesOrderItem[]) {
    if (toIndex == -1) fields.unshift(generateItem(0));
    else if (toIndex == fields.length - 1) fields.push(generateItem(toIndex));
    else
        fields = [
            ...fields.slice(0, toIndex),
            generateItem(toIndex),
            ...fields.slice(toIndex)
        ];
    return calibrateLines(fields);
}
export function calibrateLines(fields) {
    return fields.map((i, uid) => {
        return {
            ...i,
            meta: removeEmptyValues({
                ...(i?.meta || {}),
                uid
            })
        };
    }) as ISalesOrderItem[];
}
export function insertLine(items, index, item) {
    if (!items) items = [];
    return [...items.slice(0, index), item, ...items.slice(index)];
}
export function footerEstimate({
    form,
    footerInfo,
    settings
}: {
    footerInfo: IFooterInfo;
    form: ISalesOrderForm;
    settings: ISalesSettingMeta;
}) {
    let subTotal = 0;
    let tax = 0;
    let taxxableSubTotal = 0;
    let ccc = 0;
    // const b = form.getValues("");
    const taxPercentage = convertToNumber(form.getValues("taxPercentage"), 0);
    const cccPercentage = settings?.ccc;
    Object.entries(footerInfo.rows).map(([k, row]) => {
        if (row.total > 0) {
            subTotal += +row.total;
            if (!row.notTaxxed) {
                taxxableSubTotal += +row.total;
                const lineTax = +row.total * (taxPercentage / 100);
                form.setValue(`items.${row.rowIndex}.tax`, +lineTax || 0);
            }
        }
    });

    const labourCost = convertToNumber(form.getValues("meta.labor_cost"), 0);
    let total = +toFixed(subTotal + tax + labourCost);
    if (
        form.getValues("meta.payment_option") == "Credit Card" &&
        cccPercentage > 0
    ) {
        ccc = +toFixed((cccPercentage / 100) * total);
    }
    if (taxxableSubTotal > 0 && taxPercentage > 0)
        tax = taxxableSubTotal * (taxPercentage / 100);

    form.setValue("subTotal", toFixed(subTotal));
    form.setValue("tax", toFixed(tax));
    form.setValue("meta.ccc", +ccc);
    form.setValue("meta.ccc_percentage", cccPercentage);
    form.setValue("grandTotal", toFixed(ccc + tax + total));
}

export function openComponentModal(item: ISalesOrderItem, rowIndex) {
    let c = item?.meta?.components;
    const components = c || {};
    // ([
    //   {
    //     type: "Door",
    //   },
    //   {
    //     type: "Frame",
    //   },
    //   {
    //     type: "Hinge",
    //   },
    //   {
    //     type: "Casing",
    //   },
    // ] as any);
    openModal("salesComponent", {
        rowIndex,
        item,
        components
    });
}
interface ComposeItemDescriptionProps {
    wizard: ISalesWizard;
    kvForm: WizardKvForm;
}
export function composeItemDescription({
    wizard,
    kvForm
}: ComposeItemDescriptionProps) {
    let description = wizard.titleMarkdown;
    wizard.form.map(f => {
        let fv = kvForm[f.uuid];
        let title = fv?.title || f?.defaultPrintValue || "";
        description = description.replace(`@${f.label}`, title);
    });
    description = description.replace(/^\||\|$/g, "");
    description = description.replace(/\|\s*\|/g, "|");
    description = description.replace(/\|\s*$/g, "");

    return description;
}
export function copySalesItem(item) {
    const { id, meta, createdAt, updatedAt, ...itemData } = deepCopy(
        item || {
            meta: {}
        }
    ) as ISalesOrderItem;
    const { produced_qty, uid, ..._meta } = meta as ISalesOrderItemMeta;
    return {
        ...itemData,
        meta: _meta
    };
}
