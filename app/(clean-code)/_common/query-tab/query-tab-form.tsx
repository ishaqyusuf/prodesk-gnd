import Modal from "@/components/common/modal";
import { _modal } from "@/components/common/modal/provider";
import { useForm } from "react-hook-form";
import { QueryTab } from "./provider";
import { Form } from "@/components/ui/form";

interface Props {
    ctx?: QueryTab;
    data?: { id?; title?; query };
}
export const openQueryTab = (ctx: Props["ctx"], data: Props["data"]) => {
    _modal.openModal(<QueryTabForm ctx={ctx} data={data} />);
};
export function QueryTabForm({ ctx, data }: Props) {
    const form = useForm({
        defaultValues: {
            ...data,
        },
    });
    return (
        <Modal.Content size="sm">
            <Modal.Header title="Query Tab" />
            <Form {...form}>
                <div className=""></div>
            </Form>
        </Modal.Content>
    );
}
