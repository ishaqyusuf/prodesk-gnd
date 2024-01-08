import Btn from "@/components/_v1/btn";
import { MergeCustomerModalProps, useMergeCustomerFormContext } from ".";
import { useTransition } from "react";
import { mergeCustomersAction } from "./_actions/merge-customers-action";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

export default function MergeCustomerModalFooter({
    data,
}: MergeCustomerModalProps) {
    const form = useMergeCustomerFormContext();
    const primaryId = form.watch("primaryId");
    const [submitting, startSubmission] = useTransition();
    async function submit() {
        startSubmission(async () => {
            const formData = form.getValues();
            let customer = data.customers.find(
                (c) => c.id == formData.primaryId
            );
            await mergeCustomersAction(
                customer as any,
                data.customers.map((c) => c.id)
            );
            closeModal();
            toast.success("Customers Merged");
        });
    }
    return (
        <>
            <Btn onClick={submit} isLoading={submitting} disabled={!primaryId}>
                Merge
            </Btn>
        </>
    );
}
