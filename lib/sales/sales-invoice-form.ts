import { convertToNumber, toFixed } from "@/lib/use-number";
import { ISalesSettingMeta, ISalesWizard } from "@/types/post";
import {
  IFooterInfo,
  ISalesOrderForm,
  ISalesOrderItem,
  WizardKvForm,
} from "@/types/sales";
import { openModal } from "../modal";

export function initInvoiceItems(items: ISalesOrderItem[] | undefined) {
  if (!items) items = [];
  const _itemsByIndex: any = {};
  let rows = 20;
  items.map((item) => {
    const li = [
      item.meta?.line_index,
      item.meta?.uid,
      item.meta?.lineIndex,
    ].filter((i) => i >= 0)[0];
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
  console.log(_items);
  return _items;
}
function generateItem(line_index, baseItem: any = null) {
  if (!baseItem) baseItem = { meta: {} };
  let price = baseItem?.rate || baseItem?.price;

  const _ = {
    ...baseItem,
    rate: null,
    price,
    meta: {
      tax: "Tax",
      sales_margin: "Default",
      ...(baseItem?.meta ?? {}),
      line_index,
    },
  };
  if (_.meta.length == 0) _.meta = {};
  // const _s = salesFormStore();
  if (_.product_variant_id) {
    // const pvid = useId(_.product_variant_id);
    //   _s.variantCheckBox[pvid] = true;
    // _.variant_id = pvid;
  }
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
  // console.log(".......");
}
export function addLine(toIndex, fields: ISalesOrderItem[]) {
  if (toIndex == -1) fields.unshift(generateItem(0));
  else if (toIndex == fields.length - 1) fields.push(generateItem(toIndex));
  else
    fields = [
      ...fields.slice(0, toIndex),
      generateItem(toIndex),
      ...fields.slice(toIndex),
    ];

  return calibrateLines(fields);
}
export function calibrateLines(fields) {
  return fields.map((i, uid) => {
    return {
      ...i,
      meta: {
        ...i.meta,
        uid,
      },
    };
  });
}

export function footerEstimate({
  form,
  footerInfo,
  settings,
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
      subTotal += row.total;
      if (!row.notTaxxed) taxxableSubTotal += row.total;
    }
  });

  const labourCost = convertToNumber(form.getValues("meta.labour_cost"), 0);
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
  const components =
    c ||
    ([
      {
        type: "Door",
      },
      {
        type: "Frame",
      },
      {
        type: "Hinge",
      },
      {
        type: "Casing",
      },
    ] as any);
  openModal("salesComponent", {
    rowIndex,
    item,
    components,
  });
}
interface ComposeItemDescriptionProps {
  wizard: ISalesWizard;
  kvForm: WizardKvForm;
}
export function composeItemDescription({
  wizard,
  kvForm,
}: ComposeItemDescriptionProps) {
  let description = wizard.titleMarkdown;
  console.log("MARKDOWN:", description);
  console.log(kvForm);
  wizard.form.map((f) => {
    let fv = kvForm[f.uuid];
    console.log(fv);
    let title = fv?.title || f?.defaultPrintValue || "";
    description = description.replace(`@${f.label}`, title);
  });
  description = description.replace(/^\||\|$/g, "");
  description = description.replace(/\|\s*\|/g, "|");
  description = description.replace(/\|\s*$/g, "");

  return description;
}
