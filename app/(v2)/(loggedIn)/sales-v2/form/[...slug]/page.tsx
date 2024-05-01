import { Metadata } from "next";
import SalesFormComponent from "../components";
import { getDykeFormAction } from "../_action/get-dyke-form";
import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import AuthGuard from "@/components/_v1/auth-guard";
import { prisma } from "@/db";

export const metadata: Metadata = {
    title: "Sales Form",
    description: "",
};
export default async function SalesForm({ params }) {
    const [type, slug] = params.slug;
    const form = await getDykeFormAction(type, slug);

    // const _doors = await prisma.dykeDoors.findMany({
    //     select: {
    //         id: true,
    //         title: true,

    //     },
    // });
    // const unique = _doors.filter(
    //     (d, i) => i == _doors.findIndex((_) => _.title == d.title)
    // );
    // console.log([_doors.length, unique.length]);
    // let f = _doors.filter((d) => d.title == unique[0]?.title);
    // console.log(f);

    metadata.title = `${slug ? "Edit " : "New "} ${form.order.type} ${
        slug && `| ${slug}`
    }`;
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
