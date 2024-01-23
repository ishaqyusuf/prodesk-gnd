import { Breadcrumbs } from "@/components/_v1/breadcrumbs";
import { BreadLink } from "@/components/_v1/breadcrumbs/links";
import { DimensionList } from "./_actions/list";
import { getHousePackageTool } from "./_actions/get-house-package-tool";

export default async function housePackageToolPage() {
    const data = await getHousePackageTool();
    return (
        <div>
            <Breadcrumbs>
                <BreadLink isFirst title="Sales" />
                <BreadLink title="v2" />
                <BreadLink isLast title="House Package Tool" />
            </Breadcrumbs>
            <DimensionList data={data} />
        </div>
    );
}
