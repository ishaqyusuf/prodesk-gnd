import { useModal } from "@/_v2/components/common/modal/provider";

import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useEffect } from "react";
import { useForm, useFormContext } from "react-hook-form";
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

export default function SubmitJobModal() {
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
        ctx.initialize(modal?.data);
    }, []);
    return (
        // <Dialog open={modal?.opened} onOpenChange={modal?.setShowModal}>
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
                    <SubmitJobModalFooter />{" "}
                </DialogFooter>
            </JobSubmitContext.Provider>
        </Form>
        // </Dialog>
    );
}
