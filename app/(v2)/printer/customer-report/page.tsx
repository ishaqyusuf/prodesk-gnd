import BasePrinter from "../base-printer";
import { generateCustomerPrintReport } from "./_action";
import ReportCtx from "./report-ctx";

export default async function CustomerReportPage({
    searchParams,
}: {
    searchParams;
}) {
    const ids = searchParams.slugs
        ?.split(",")
        .map((v) => Number(v))
        .filter((v) => v > 0);
    const value = {
        ...searchParams,
    };
    const actions = ids?.map((id) => ({
        slug: id,
        action: generateCustomerPrintReport(id),
    }));
    // return (
    //     <>
    //         {actions.map((action) => (
    //             <ReportCtx key={action.slug} {...action} />
    //         ))}
    //     </>
    // );
    return (
        <BasePrinter {...value} slugs={ids}>
            {actions.map((action) => (
                <ReportCtx key={action.slug} {...action} />
            ))}
        </BasePrinter>
    );
}
