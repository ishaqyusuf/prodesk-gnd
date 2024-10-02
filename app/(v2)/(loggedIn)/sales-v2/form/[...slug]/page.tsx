import SalesFormComponent from "../components";
import { getDykeFormAction } from "../_action/get-dyke-form";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import AuthGuard from "@/app/(v2)/(loggedIn)/_components/auth-guard";
import { copyDykeSales } from "@/app/(v1)/(loggedIn)/sales/_actions/copy-dyke-sale";
import { getErrorData } from "../_action/error/save-error";
import { prisma } from "@/db";
import MigrateStepDuplicateUid from "./_debug/migrate-steps-duplicate-uid";
import { groupBy } from "lodash";

export async function generateMetadata({ params, searchParams }) {
    const [type, slug] = params.slug;
    const title = `${slug ? "Edit " : "New "} ${type} ${
        slug ? `| ${slug}` : ""
    }`;
    return {
        title,
    };
}
export default async function SalesForm({ params, searchParams }) {
    // const deletes = await prisma.dykeSteps.updateMany({
    //     where: {
    //         OR: [
    //             {
    //                 id: { gt: 3 },
    //                 title: "Width",
    //             },
    //             {
    //                 id: { gt: 13 },
    //                 title: "Height",
    //             },
    //             {
    //                 id: { gt: 22 },
    //                 title: "Hand",
    //             },
    //         ],
    //     },
    //     data: {
    //         deletedAt: new Date(),
    //     },
    // });
    // const duplicates = await prisma.dykeSteps.findMany({
    //     // where: {
    //     //     title: "Door Type",
    //     // },
    //     select: {
    //         id: true,
    //         uid: true,
    //         title: true,

    //         _count: {
    //             select: {
    //                 stepForms: {
    //                     where: {
    //                         deletedAt: null,
    //                     },
    //                 },
    //                 stepProducts: {
    //                     where: {
    //                         deletedAt: null,
    //                     },
    //                 },
    //             },
    //         },
    //         stepProducts: {
    //             where: {
    //                 deletedAt: null,
    //             },
    //             select: {
    //                 uid: true,
    //                 product: {
    //                     where: {
    //                         deletedAt: null,
    //                     },
    //                     select: {
    //                         title: true,
    //                     },
    //                 },
    //             },
    //         },
    //     },
    //     // distinct: "title",
    // });
    // let updates = 0;

    // const grouped = groupBy(
    //     duplicates.filter(
    //         (s) => duplicates.filter((a) => a.title == s.title).length > 1
    //     ),
    //     "title"
    // );

    // await Promise.all(
    //     Object.values(grouped).map(async (grp) => {
    //         let [main, ...rest] = grp;
    //         await prisma.$transaction((async (tx: typeof prisma) => {
    //             console.log(main);
    //             const ids = rest.map((s) => s.id);
    //             const stepProds = await tx.dykeStepProducts.updateMany({
    //                 where: {
    //                     nextStepId: {
    //                         in: ids,
    //                     },
    //                 },
    //                 data: {
    //                     nextStepId: main.id,
    //                 },
    //             });
    //             const stespforms = await tx.dykeStepForm.updateMany({
    //                 where: {
    //                     stepId: { in: ids },
    //                 },
    //                 data: {
    //                     stepId: main.id,
    //                 },
    //             });

    //             updates += stespforms.count + stepProds.count;
    //         }) as any);
    //     })
    // );
    // console.log(updates);

    // <span>42-vkQGB</span>
    // console.log(
    //     await prisma.dykeSteps.findMany({
    //         where: {
    //             stepProducts: {
    //                 some: {
    //                     uid: {
    //                         in: ["j2SdP", "WGPOd"],
    //                     },
    //                 },
    //             },
    //             // uid: {
    //             //     in: ["j2SdP"],
    //             // },
    //         },
    //         include: {
    //             stepProducts: {
    //                 where: {
    //                     uid: {
    //                         in: ["j2SdP", "WGPOd"],
    //                     },
    //                 },
    //             },
    //         },
    //     })
    // );
    // await prisma.dykeSteps.updateMany({
    //     where: {
    //         id: {
    //             in: [42],
    //             // [21, 42]
    //         },
    //     },
    //     data: {
    //         uid: "vkQGB",
    //         // uid: "wUGhI",
    //     },
    // });
    const [type, slug] = params.slug;
    let copy = searchParams.copy;
    // console.log(slug);

    // const steps = await prisma.dykeStepProducts.findMany({
    //     where: {
    //         product: {
    //             title: "HC Molded",
    //         },
    //     },
    // });
    // console.log(steps.map((s) => s.uid));
    const form = searchParams.errorId
        ? await getErrorData(searchParams.errorId)
        : copy
        ? await copyDykeSales(copy, type)
        : await getDykeFormAction(type, slug, searchParams);
    if (!form) throw Error("Errorr...");
    return (
        <AuthGuard can={["editOrders"]}>
            <div className="sm:px-8 px-4">
                <Breadcrumbs>
                    <BreadLink title={"Sales"} isFirst link={"/sales/orders"} />
                    {slug && (
                        <BreadLink
                            title={slug}
                            link={`/sales-v2/overview/${type}/${slug}`}
                        />
                    )}
                    <BreadLink title={slug ? "Edit" : "New"} isLast />
                    {/* <BreadLink title={orderId ? "Edit" : "New"} isLast /> */}
                </Breadcrumbs>
                <SalesFormComponent defaultValues={form} />
            </div>
        </AuthGuard>
    );
}
