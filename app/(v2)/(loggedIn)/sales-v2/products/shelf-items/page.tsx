import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import DykeTabLayout from "../components/dyke-tab-layout";

export default function ProductsPage({}) {
    return (
        <DykeTabLayout>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink isLast title="Shelf Products" />
            </Breadcrumbs>
            <div className=""></div>
        </DykeTabLayout>
    );
}
