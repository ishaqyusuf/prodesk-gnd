"use client";

import { _revalidate } from "@/app/(v1)/_actions/_revalidate";
import {
    TimelineUpdateProps,
    updateTimelineAction,
} from "@/app/(v1)/_actions/progress";
import ControlledInput from "@/components/common/controls/controlled-input";
import ControlledSelect from "@/components/common/controls/controlled-select";
import Modal from "@/components/common/modal";
import { useModal } from "@/components/common/modal/provider";
import { Form } from "@/components/ui/form";
import { capitalizeFirstLetter } from "@/lib/utils";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export default function TimelineModal(props: Partial<TimelineUpdateProps>) {
    const form = useForm<TimelineUpdateProps>({
        defaultValues: {
            ...props,
        },
    });

    const watchType = form.watch("type");
    useEffect(() => {
        form.setValue(
            "status",
            [watchType, "update"].map((c) => capitalizeFirstLetter(c)).join(" ")
        );
    }, [watchType]);
    const modal = useModal();

    async function submit() {
        await updateTimelineAction("SalesOrder", {
            ...form.getValues(),
        });
        // route.refresh();
        // closeModal("salesTimeline");
        toast.message("Timeline updated!");
        await _revalidate("salesOverview");
        modal.close();
    }
    const options = ["Production", "Invoice", "Supply"].map((value) => ({
        value: value?.toLowerCase(),
        label: value,
    }));
    return (
        <Form {...form}>
            <Modal.Content>
                <Modal.Header title="Update Timeline" />
                <div className="grid md:grid-cols-2 gap-4">
                    <ControlledSelect
                        control={form.control}
                        name={"type"}
                        label={"Update Type"}
                        options={options}
                    />
                    <ControlledInput
                        control={form.control}
                        name="status"
                        label="Headline"
                    />
                    <ControlledInput
                        className="col-span-2"
                        control={form.control}
                        name="note"
                        label="Note"
                        type="textarea"
                    />
                </div>
                <Modal.Footer onSubmit={submit}></Modal.Footer>
            </Modal.Content>
        </Form>
    );
}
