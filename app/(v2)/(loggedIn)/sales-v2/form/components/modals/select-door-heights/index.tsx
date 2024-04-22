import Modal from "@/components/common/modal";
import { IStepProducts } from "../../step-items-list/item";
import { DykeForm } from "../../../../type";
import { UseFormReturn, useFieldArray, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { getHousePackageTool } from "../../../../dimension-variants/_actions/get-house-package-tool";
import { getDimensionSizeList } from "../../../../dimension-variants/_actions/get-size-list";
import { Form } from "@/components/ui/form";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { useModal } from "@/components/common/modal/provider";

interface Props {
    form: UseFormReturn<DykeForm>;
    stepProd: IStepProducts[0];
    rowIndex;
}
export default function SelectDoorHeightsModal({
    form,
    rowIndex,
    stepProd,
}: Props) {
    const item = form.getValues(`itemArray.${rowIndex}`);
    const heightsKey = `itemArray.${rowIndex}.multiComponent.${stepProd.product.title}.heights`;
    const heights: DykeForm["itemArray"][0]["multiComponent"][""]["heights"] =
        form.getValues(
            `itemArray.${rowIndex}.multiComponent.${stepProd.product.title}.heights`
        );
    const height = form.watch(
        `itemArray.${rowIndex}.item.housePackageTool.height`
    );
    const doorType = item.item.meta.doorType;
    const [sizes, setSizes] = useState<{ dim: string; width: string }[]>([]);
    const sizeForm = useForm<{
        sizes: {
            [id in string]: {
                checked?: boolean;
                dim?: string;
                width?: string;
            };
        };
    }>({
        defaultValues: {
            sizes: {},
        },
    });

    useEffect(() => {
        (async () => {
            const _sizes = await getDimensionSizeList(
                height,
                doorType == "Bifold"
            );
            let _defData: any = {};
            Object.entries(heights || {}).map(([k, v]) => {
                const s = _sizes.find((s) => s.dim == (k as any));
                _defData[k] = {
                    // checked: s != null,
                    ...(s || {}),
                    ...(v || {}),
                };
            });
            console.log(_defData);

            sizeForm.reset({
                sizes: _defData,
            });
            console.log(_defData);

            setSizes(_sizes);
        })();
    }, []);
    const modal = useModal();
    function onSubmit() {
        const sizesData = sizeForm.getValues("sizes");
        const checked = (Object.values(sizesData).filter((s) => s.checked)
            ?.length > 0) as any;
        console.log(sizesData);
        form.setValue(heightsKey as any, sizesData);
        form.setValue(
            `itemArray.${rowIndex}.multiComponent.${stepProd.product.title}.checked`,
            checked
        );
        modal.close();
    }
    return (
        <Modal.Content>
            <Modal.Header
                title="Select Sizes"
                subtitle={stepProd.product.title || ""}
            />
            <Form {...sizeForm}>
                <div className="grid gap-2 grid-cols-3">
                    {sizes.map((size, index) => {
                        return (
                            <div className="" key={index}>
                                <ControlledCheckbox
                                    control={sizeForm.control}
                                    name={`sizes.${size.dim}.checked` as any}
                                    label={size.dim}
                                />
                            </div>
                        );
                    })}
                </div>
            </Form>
            <Modal.Footer
                submitText="Proceed"
                onSubmit={onSubmit}
            ></Modal.Footer>
        </Modal.Content>
    );
}
