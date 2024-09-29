import Modal from "@/components/common/modal";
import { IStepProducts } from "../step-items-list/item-section/component-products";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ProductImage } from "../step-items-list/item-section/component-products/product";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/_v1/icons";
import {
    getDykeStepState,
    getFormSteps,
} from "../step-items-list/item-section/component-products/init-step-components";
import { useForm } from "react-hook-form";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { Form } from "@/components/ui/form";
import { saveStepProduct } from "../../_action/save-step-product";
import { toast } from "sonner";

interface Props {
    products: IStepProducts;
    setStepProducts;
    invoiceForm;
    lineItemIndex;
    stepIndex;
    stepForm;
}
export default function RestoreComponentsModal({
    products,
    invoiceForm,
    lineItemIndex,
    stepIndex,
    stepForm,
}: Props) {
    const [sortedProds, setSortedProds] = useState(
        products
            .filter((p) => p._metaData?.hidden)
            .sort((a, b) => a.product.title?.localeCompare(b.product.title))
    );
    const form = useForm({
        defaultValues: {
            deleteSelections: {},
            // deletables: {},
            show: {},
        },
    });
    const [restoredUids, setRestoredUids] = useState({});
    const [components, setComponents] = useState<
        ReturnType<typeof getDykeStepState>
    >([]);
    useEffect(() => {
        const formArray = invoiceForm.getValues(
            `itemArray.${lineItemIndex}.item.formStepArray`
        );
        const _depFormSteps = getFormSteps(formArray, stepIndex);
        // console.log({ _depFormSteps, stepForm, formData });
        const stateDeps = getDykeStepState(_depFormSteps, stepForm);
        setComponents(stateDeps);
    }, []);
    async function _restore(item: IStepProducts[number]) {
        // console.log(item);
        const d = form.getValues("show");
        let _show = item.meta.show || {};

        let valid = false;
        Object.entries(d).map(
            ([k, v]) => v && (_show[k] = true) && (valid = true)
        );
        item.meta.show = _show;
        const reps = await saveStepProduct(item);
        toast.success("Restored");
    }
    return (
        <Modal.Content size="lg">
            <Modal.Header
                title="Restore"
                subtitle={"select component dependencies to start restore."}
            />
            <Form {...form}>
                <div className="flex gap-4 flex-wrap">
                    {components?.map((d, i) => (
                        <div key={i}>
                            <ControlledCheckbox
                                control={form.control}
                                name={`show.${d.key}` as any}
                                label={d.steps.map((s) => s.value).join(" & ")}
                            />
                        </div>
                    ))}
                </div>
            </Form>
            <ScrollArea className="h-[70vh]">
                <div className="grid grid-cols-3 gap-4">
                    {sortedProds?.map((item) => (
                        <button
                            onClick={() => {
                                _restore(item);
                            }}
                            key={item.id}
                            className={cn(
                                "flex relative flex-col items-center hover:shadow-sm hover:border"
                            )}
                        >
                            {/* {restores[item.uid] && tab == "restore" && (
                            <div className="absolute left-0 m-2">
                                <CheckCircle2Icon className="w-6 h-6 text-purple-500" />
                            </div>
                        )} */}
                            <PriceInfo prod={item} />
                            <div className="w-2/3 h-16s overflow-hidden">
                                <ProductImage aspectRatio={1 / 1} item={item} />
                            </div>
                            <div className="">
                                <span className=" text-sm">
                                    {item.product.title}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </ScrollArea>
            <Modal.Footer />
        </Modal.Content>
    );
}
function PriceInfo({ prod }: { prod: IStepProducts[number] }) {
    let priceLen = Object.values(prod.door?.meta?.doorPrice || {}).filter(
        Boolean
    ).length;
    if (priceLen)
        return (
            <div id="" className="absolute right-0 top-0 flex ">
                <Label>{priceLen}</Label>
                <Icons.dollar className="text-muted-foreground w-4 h-4" />
            </div>
        );
    return null;
}
