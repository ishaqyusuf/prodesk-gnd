import { AsyncFnType } from "@/app/(clean-code)/type";
import { prisma } from "@/db";
import { Prisma } from "@prisma/client";
import {
    DykeProductMeta,
    StepComponentForm,
    StepComponentMeta,
} from "../../types";

export interface LoadStepComponentsProps {
    stepId?: number;
    stepTitle?: "Door" | "Moulding";
    id?;
}
export async function loadStepComponentsDta(props: LoadStepComponentsProps) {
    const prods = await __getStepProducts(props);
    const resp = prods
        .filter((p) => p.product || p.door)
        .map(transformStepProduct);
    if (resp.filter((s) => s.sortIndex >= 0).length)
        return resp.sort((a, b) => a.sortIndex - b.sortIndex);
    return resp;
}
export async function __getStepProducts(props: LoadStepComponentsProps) {
    const wheres: Prisma.DykeStepProductsWhereInput[] = [];
    if (props.stepTitle == "Door")
        wheres.push({
            door: { isNot: null },
            deletedAt: {},
        });
    else if (props.stepTitle == "Moulding") {
        wheres.push({
            product: {
                category: {
                    title: props.stepTitle,
                },
            },
        });
    }
    if (props.id) wheres.push({ id: props.id });
    if (props.stepId)
        wheres.push({
            dykeStepId: props.stepId,
        });

    const stepProducts = await prisma.dykeStepProducts.findMany({
        where:
            wheres.length == 0
                ? wheres[0]
                : {
                      AND: wheres,
                  },
        include: {
            door: props.stepTitle != null,
            product: true,
        },
    });
    if (props.stepId)
        return stepProducts.filter(
            (_, i) =>
                stepProducts.findIndex(
                    (p) =>
                        p.dykeProductId == _.dykeProductId ||
                        p.product?.title == _.product?.title
                ) == i
        );
    return stepProducts;
}

export function transformStepProduct(
    _prod: AsyncFnType<typeof __getStepProducts>[number]
) {
    const { door, product, ...prod } = _prod;
    let meta: StepComponentMeta = prod.meta as any;
    if (!prod.meta)
        meta = {
            stepSequence: [],
            deleted: {},
            show: {},
        };
    let prodMeta: DykeProductMeta = product?.meta || door?.meta || ({} as any);
    if (door)
        prodMeta = {
            // ...findDoorSvg(prod.door.title, prod.door.img),
            ...prodMeta,
        };
    return {
        ...prod,
        meta,
        // door: prod.door
        //     ? {
        //           ...prod.door,
        //           meta: prodMeta,
        //       }
        //     : undefined,
        isDoor: prod.doorId > 0,
        // product: prod.product
        //     ? {
        //           ...prod.product,
        //           meta: prodMeta,
        //       }
        //     : {
        //           ...prod.door,
        //           value: prod.door.title,
        //           description: prod.door.title,
        //           meta: prodMeta,
        //       },
        _metaData: {
            price: null,
            hidden: false,
            basePrice: null,
        },
    };
}

export async function updateStepComponentDta(id, data) {
    return await prisma.dykeStepProducts.update({
        where: { id },
        data: {
            ...data,
        },
    });
}
export async function createStepComponentDta(data: StepComponentForm) {
    const meta = {} satisfies StepComponentMeta;
    const c = await prisma.dykeStepProducts.create({
        data: {
            custom: data.custom,
            meta,
            step: {
                connect: { id: data.stepId },
            },
            door: data.isDoor
                ? {
                      create: {
                          title: data.title,
                          img: data.img,
                      },
                  }
                : undefined,
            product: data.isDoor
                ? undefined
                : {
                      create: {
                          title: data.title,
                          value: data.title,
                          img: data.img,
                      },
                  },
        },
        include: {
            door: data.isDoor,
            product: !data.isDoor,
        },
    });
    const resp = transformStepProduct(c);
}
