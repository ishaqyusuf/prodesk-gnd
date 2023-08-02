"use server";

import { prisma } from "@/db";

import {
  ISalesOrder,
  ISalesOrderItem,
  ISalesOrderItemMeta,
  ISalesOrderMeta,
  WizardKvForm,
} from "@/types/sales";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import orderProdQtyUpdateAction from "./sales";
import { ISalesSetting, ISalesSettingMeta } from "@/types/post";
import { composeItemDescription } from "@/lib/sales/sales-invoice-form";
import { getSettingAction } from "./settings";
export async function dbUpgradeAction() {
  await addTypeToSalesOrder();
  await upgradeOrderQty();
  await transformItemComponent();
}
async function addTypeToSalesOrder() {
  const updates: any = {
    order: [],
    estimate: [],
  };
  (
    await prisma.salesOrders.findMany({
      select: {
        id: true,
        prodId: true,
        meta: true,
      },
    })
  ).map((e) => {
    let meta: ISalesOrderMeta = e?.meta as any;
    if (meta?.type == "estimate") updates.estimate.push(e.id);
    else updates.order.push(e.id);
  });
  await Promise.all(
    Object.entries(updates).map(async ([type, ids]) => {
      let data: any = {
        type,
      };
      if (type == "estimate") data.prodId = null;
      await prisma.salesOrders.updateMany({
        where: {
          id: {
            in: ids as number[],
          },
        },
        data,
      });
    })
  );
}
async function upgradeOrderQty() {
  const orders = await prisma.salesOrders.findMany({
    where: {},
    select: {
      id: true,
    },
  });
  orders.map(async (o) => {
    await orderProdQtyUpdateAction(o.id);
  });
}
interface oldComponentCost {
  id;
  type;
  title;
  qty;
  cost;
}
async function transformItemComponent() {
  let { id, meta, ...salesSetting } = (await getSettingAction<ISalesSetting>(
    "sales-settings"
  )) as ISalesSetting;
  let {
    wizard: { titleMarkdown } = {},
    ...salesMeta
  } = meta as ISalesSettingMeta;
  const doorUUID = randomUUID();
  const labelUUIDMAP = {
    Door: doorUUID,
    Frame: randomUUID(),
    Casing: randomUUID(),
    Hinge: randomUUID(),
  };
  let form: any = [
    {
      category: "Door",
      uuid: doorUUID,
      inputType: "Text",
      hasQty: true,
      hasCost: true,
      label: "Door",
    },
  ];
  Object.entries(labelUUIDMAP).map(
    ([k, v]) =>
      k != "Door" &&
      form.push({
        category: k,
        uuid: v,
        label: k,
        hasQty: true,
        inputType: "Text",
        depId: doorUUID,
        hasCost: true,
        defaultQty: 1,
      })
  );
  titleMarkdown =
    "@Door \n    Frame: @Frame \n   Hinge: @Hinge \n    Casing: @Casing";
  await prisma.posts.update({
    where: {
      id,
    },
    data: {
      meta: {
        ...salesMeta,
        wizard: {
          form,
          titleMarkdown,
        },
      } as any,
    },
  });
  const items = await prisma.salesOrderItems.findMany({
    where: {
      productVariantId: {
        gt: 0,
      },
    },
  });
  console.log(items?.length);
  (items as ISalesOrderItem[]).map(async (item) => {
    let { productVariantId, meta } = item;
    let {
      components,
      product_cost,
      product_description,
      line_index,
      ..._meta
    } = meta as ISalesOrderItemMeta;
    if (productVariantId && (components as any)?.length > 0) {
      let oc: oldComponentCost[] = components as any;
      let wiz: WizardKvForm = {};
      const eDoor =
        (await prisma.orderInventory.findFirst({
          where: {
            category: "Door",
            name: product_description,
            price: product_cost,
          },
        })) ||
        (await prisma.orderInventory.create({
          data: {
            price: product_cost,
            category: "Door",
            name: product_description,
            createdAt: new Date(),
            meta: {},
          },
        }));
      oc.map(async ({ cost, qty, title, type }, i) => {
        if (i == 1) return;
        const cuid = labelUUIDMAP[type];

        if ((title || cost) && cuid) {
          let _e =
            (await prisma.orderInventory.findFirst({
              where: {
                category: type,
                parentId: eDoor?.id,
                price: cost,
                name: title,
              },
            })) ||
            (await prisma.orderInventory.create({
              data: {
                category: type,
                price: cost,
                name: title,
                createdAt: new Date(),
                parentId: eDoor?.id,
                meta: {},
              },
            }));
          wiz[cuid] = {
            price: cost,
            productId: _e?.id,
            uuid: cuid,
            title,
            qty,
            checked: qty > 0 && cost > 0,
            category: type,
            total: (cost + 0) * (qty + 0),
          };
        }
      });
      _meta.isComponent = true;
      await prisma.salesOrderItems.update({
        where: { id: item.id },
        data: {
          description: composeItemDescription({
            wizard: { form, titleMarkdown },
            kvForm: wiz,
          }),
          meta: {
            ...(_meta as any),
            components: wiz,
          },
        },
      });
    }
  });
}
