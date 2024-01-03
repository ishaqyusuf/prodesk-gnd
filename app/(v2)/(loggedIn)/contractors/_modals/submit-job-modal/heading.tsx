import { Button } from "@/components/ui/button";
import { SubmitJobModalProps, useSubmitJobForm } from ".";
import useSubmitJob from "./use-submit-job";
import { Icons } from "@/components/_v1/icons";

export function Title({ data }: SubmitJobModalProps) {
    const ctx = useSubmitJob();
    function goBack() {
        const [tab1, ...tabs] = ctx.tabHistory.fields;
        ctx.tabHistory.remove(0);
        ctx.form.setValue("tab", tab1?.title);
    }
    return (
        <div className="flex space-x-2 items-center">
            {ctx.tabHistory.fields.length > 0 && (
                <Button variant={"ghost"} className="h-8 w-8" onClick={goBack}>
                    <Icons.arrowLeft className="h-4 w-4" />
                </Button>
            )}
            {
                {
                    user: "Select Employee",
                    project: "Select Project",
                    unit: "Select Unit",
                    tasks: "Task Information",
                    general: "Other Information",
                }[ctx.tab]
            }
        </div>
    );
}
export function Subtitle({ data }: SubmitJobModalProps) {
    const ctx = useSubmitJob();

    if (ctx.id && data?.data?.subtitle)
        return <div>{data?.data?.subtitle}</div>;
}
