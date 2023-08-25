import { getSettingAction } from "@/app/_actions/settings";
import { prisma } from "@/db";
import { transformData } from "@/lib/utils";
import { ISalesSetting } from "@/types/post";
import { ISalesOrderItemMeta } from "@/types/sales";
import { JoomagProduct, Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

interface IData extends JoomagProduct {
  meta: {};
}
interface IHeader {
  el: HTMLElement;
  x;
  y;
  title;
}
export async function GET(req: Request) {
  const url = new URL(req.url);
  const sku = url.searchParams.get("sku");
  const prod = await prisma.productVariants.findMany({
    where: {
      sku: sku,
    },
  });
  return NextResponse.json(
    {
      product: prod,
    },
    {
      status: 200,
    }
  );
}
interface JoomagProductPostReq {
  product: JoomagProduct;
  orderId;
  uid;
  componentUUid;
  qty;
  total;
  swing;
  price;
  tax;
  taxPercentage;
}
export async function POST(req: Request) {
  const form: JoomagProductPostReq = await req.json();
  // let prod: JoomagProduct = form.product;

  const {
    product: prod,
    orderId: id,
    uid,
    componentUUid: cuuid,
    qty,
    total,
    price,
    swing,
    tax,
    taxPercentage,
  } = form;

  const meta: ISalesOrderItemMeta = {} as any;
  meta.uid = uid;
  meta.isComponent = true;
  meta.components = {
    [cuuid]: {
      total: total,
      price,
      qty: qty,
      title: prod.title,
    },
  };
  meta.tax = "Tax";
  const itemData: Prisma.Without<
    Prisma.SalesOrderItemsUncheckedCreateInput,
    Prisma.SalesOrderItemsCreateInput
  > &
    Prisma.SalesOrderItemsCreateInput = {
    salesOrder: {
      connect: {
        id,
      },
    },
    meta: meta as any,
    description: prod.description,
    swing,
    qty,
    rate: +price,
    total,
    taxPercenatage: taxPercentage,
    tax,
  };
  const item = await prisma.salesOrderItems.create({
    data: transformData(itemData as any),
  });

  return NextResponse.json({});
}
