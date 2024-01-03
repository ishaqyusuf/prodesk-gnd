import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStaticContractors } from "@/_v2/hooks/use-static-data";
import { Users } from "@prisma/client";
import { getContractorsAction } from "../../_actions/get-job-employees";
import useSubmitJob from "./use-submit-job";
import { changeJobWorkerAction } from "./_actions/change-job-worker";
import { _revalidate } from "@/app/(v1)/_actions/_revalidate";

export default function SelectUserField() {
    // const {resetFields} = form;
    const contractors = useStaticContractors();
    const ctx = useSubmitJob();
    async function selectContractor(contractor: Users) {
        if (ctx.id) {
            const oldUserId = ctx.getValues("job.userId");
            if (oldUserId != contractor.id)
                await changeJobWorkerAction(ctx.id, oldUserId, contractor.id);

            ctx.setValue("job.userId", contractor.id);
            if (ctx.action == "change-worker") {
                await _revalidate("jobs");
                closeModal();
            } else {
                ctx.nextTab();
            }
        }
    }
    return (
        <div className="">
            <ScrollArea className="h-[350px] pr-4">
                <div className="flex flex-col divide-y">
                    {contractors.data?.map((user) => (
                        <Button
                            onClick={() => selectContractor(user)}
                            // onClick={async () => {
                            //     if (data?.changeWorker) {
                            //         await _changeWorker(
                            //             data?.data?.id,
                            //             data?.data?.userId,
                            //             user?.id
                            //         );
                            //         toast.success("Worker changed!");
                            //         closeModal();
                            //         return;
                            //     }
                            //     form.setValue("userId", user.id as any);
                            //     _setTab("tasks");
                            // }}
                            variant={"ghost"}
                            key={user.id}
                            className=""
                        >
                            <p className="flex w-full">{user.name}</p>
                        </Button>
                    ))}
                </div>
            </ScrollArea>
        </div>
    );
}
