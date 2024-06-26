import { useContext } from "react";
import { SubmitModalContext } from "./context";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SubmitJobTitle({ data }) {
    const { isPunchout, resetFields, form, prevTab, setTab, setPrevTab, tab } =
        useContext(SubmitModalContext);
    // const {resetFields} = form;
    return isPunchout() ? (
        <>Punchout Detail</>
    ) : (
        <div className="flex space-x-2 items-center">
            <span>s</span>
            {prevTab?.length > 0 && (
                <Button
                    onClick={() => {
                        const [tab1, ...tabs] = prevTab;
                        setTab(tab1);
                        setPrevTab(tabs);
                        const unitFields = [
                            "homeData",
                            "meta.taskCosts",
                            "meta.costData",
                            "homeId",
                            "subtitle",
                        ];
                        if (tab1 == "unit") resetFields(unitFields);
                        if (tab1 == "project")
                            resetFields([
                                "projectId",
                                "meta.addon",
                                "title",
                                "unit",
                                "project",
                                ...unitFields,
                            ]);
                    }}
                    className="h-8 w-8 p-0"
                    variant="ghost"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
            )}
            {data?.data?.id ? (
                <>{data?.data?.title}</>
            ) : (
                {
                    user: "Select Employee",
                    project: "Select Project",
                    unit: "Select Unit",
                    tasks: "Task Information",
                    general: "Other Information",
                }[tab]
            )}
        </div>
    );
}
