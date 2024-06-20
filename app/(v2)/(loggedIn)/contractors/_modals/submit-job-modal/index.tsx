import { useModal } from "@/components/common/modal-old/provider";

import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
    SubmitJobForm,
    SubmitJobModalContent,
    SubmitJobModalFooter,
} from "./_";
import {
    useStaticContractors,
    useStaticProjects,
} from "@/_v2/hooks/use-static-data";
import useSubmitJob, { JobSubmitContext } from "./_/use-submit-job";
import { SubmitJobModalSubtitle, SubmitJobModalTitle } from "./_/heading";
import { Form } from "@/components/ui/form";
import { IJobs } from "@/types/hrm";

interface Props {
    job?: IJobs;
    action?: "change-worker" | "";
}
export default function SubmitJobModal({ job, action }: Props) {
    const modal = useModal();
    const defaultValues = {
        // initialized: false,
        costList: [],
    };
    const form = useForm<SubmitJobForm>({
        defaultValues,
    });
    const contractors = useStaticContractors();
    const projects = useStaticProjects();

    const ctx = {
        ...useSubmitJob(form),
        contractors,
        projects,
    };
    useEffect(() => {
        ctx.initialize(job as any, action);
    }, []);
    return (
        // <Dialog open={modal?.opened} onOpenChange={modal?.setShowModal}>
        <DialogContent>
            <Form {...form}>
                <JobSubmitContext.Provider value={ctx}>
                    <DialogHeader>
                        <DialogTitle>
                            {/* <span>as</span> */}
                            <SubmitJobModalTitle />
                        </DialogTitle>
                        <DialogDescription>
                            <SubmitJobModalSubtitle data={modal?.data} />
                        </DialogDescription>
                    </DialogHeader>
                    <SubmitJobModalContent />
                    <DialogFooter>
                        <SubmitJobModalFooter />
                    </DialogFooter>
                </JobSubmitContext.Provider>
            </Form>
        </DialogContent>
        // </Dialog>
    );
}
