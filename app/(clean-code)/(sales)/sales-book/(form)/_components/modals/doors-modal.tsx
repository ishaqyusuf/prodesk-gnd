import Modal from "@/components/common/modal";
import { LegacyDykeFormStepType } from "../../_hooks/legacy-hooks";
import Button from "@/components/common/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductImage } from "@/app/(v2)/(loggedIn)/sales-v2/form/components/step-items-list/item-section/step-products/product";

interface Props {
    stepCtx: LegacyDykeFormStepType;
}
export default function DoorsModal({ stepCtx }: Props) {
    const { filteredComponents } = stepCtx;
    return (
        <Modal.Content size="xl">
            <Modal.Header title="Select Door" />
            <ScrollArea className="max-h-[70vh]">
                <div className="grid gap-4 grid-cols-4">
                    {filteredComponents.map((item) => (
                        <Button
                            variant="outline"
                            className="h-auto"
                            key={item.id}
                        >
                            <div className="h-56">
                                <ProductImage item={item} />
                            </div>
                            <div className="">{item.product.description}</div>
                        </Button>
                    ))}
                </div>
            </ScrollArea>
        </Modal.Content>
    );
}
