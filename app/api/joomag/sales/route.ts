import { getSettingAction } from "@/app/_actions/settings";
import { prisma } from "@/db";
import { ISalesSetting } from "@/types/post";
import { JoomagProduct } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

interface IData extends JoomagProduct {
  meta: {};
}
interface IHeader {
  el: HTMLElement;
  x;
  y;
  title;
}
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  if (!orderId)
    return NextResponse.json(
      {
        error: "Invalid Sales #",
      },
      {
        status: 405,
      }
    );
  const order = await prisma.salesOrders.findFirst({
    where: {
      orderId,
    },
    include: {
      items: true,
    },
  });
  if (!order)
    return NextResponse.json(
      {
        error: "Order not found",
      },
      {
        status: 405,
      }
    );

  const uido: number[] = order?.items
    ?.map((order) => Number((order.meta as any).uid))
    .sort((a, b) => b - a);
  let nextUid: number = (uido?.length > 0 ? uido[0] : -1) as any;
  const salesSettings: ISalesSetting = await getSettingAction("sales-settings");
  return NextResponse.json({
    nextUid: nextUid + 1,
    orderId: order.id,
    orderNo: order.orderId,
    componentUUid: salesSettings?.meta?.wizard?.form.find(
      (f) => f.category == "Door"
    )?.uuid,
    taxPercentage: order.taxPercentage,
  });
}
export async function POST(req: Request) {
  return NextResponse.json({
    id: 123,
  });
  const q: IData = await req.json();
  const prod = await prisma.productVariants.findMany({
    where: {
      sku: q.sku,
    },
  });
  return NextResponse.json(
    {
      product: prod || q,
    },
    {
      status: 200,
    }
  );
}
