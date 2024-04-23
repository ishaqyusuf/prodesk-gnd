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
import { safeFormText } from "@/lib/utils";

export type SizeForm = {
    [id in string]: {
        checked?: boolean;
        dim?: string;
        width?: string;
    };
};
interface Props {
    form: UseFormReturn<DykeForm>;
    // stepProd: IStepProducts[0];
    productTitle: string;
    rowIndex;
    onSubmit?(heights: SizeForm);
}

export default function SelectDoorHeightsModal({
    form,
    rowIndex,
    onSubmit,
    productTitle,
}: Props) {
    const safeTitle = safeFormText(productTitle);
    const item = form.getValues(`itemArray.${rowIndex}`);
    const heightsKey = `itemArray.${rowIndex}.multiComponent.${safeTitle}.heights`;
    const heights: DykeForm["itemArray"][0]["multiComponent"][""]["heights"] =
        form.getValues(
            `itemArray.${rowIndex}.multiComponent.${safeTitle}.heights`
        );
    console.log({ heights, safeTitle });

    const height = form.watch(
        `itemArray.${rowIndex}.item.housePackageTool.height`
    );
    const doorType = item.item.meta.doorType;
    const [sizes, setSizes] = useState<{ dim: string; width: string }[]>([]);
    const sizeForm = useForm<{
        sizes: SizeForm;
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
            console.log(_sizes);

            let _defData: any = {};
            Object.entries(heights || {}).map(([k, v]) => {
                const s = _sizes.find((s) => s.dim == (k as any));
                _defData[k] = {
                    // checked: s != null,
                    ...(v || {}),
                    dim: s?.dim,
                    width: s?.width,
                };
            });

            sizeForm.reset({
                sizes: _defData,
            });

            setSizes(_sizes);
        })();
    }, []);
    const modal = useModal();
    function _onSubmit() {
        const sizesData = sizeForm.getValues("sizes");
        Object.entries(sizesData || {}).map(([size, d]) => {
            const _d = sizes.find((_) => size == _.dim) || {};
            if (d.checked && _d) {
                sizesData[size] = {
                    checked: true,
                    ..._d,
                };
            }
        });
        const checked = (Object.values(sizesData).filter((s) => s.checked)
            ?.length > 0) as any;

        // console.log(checked, safeTitle);

        // console.log(sizesData);
        form.setValue(heightsKey as any, sizesData);
        onSubmit && onSubmit(sizesData);
        form.setValue(
            `itemArray.${rowIndex}.multiComponent.${safeTitle}.checked` as any,
            checked
        );
        modal.close();
    }
    return (
        <Modal.Content>
            <Modal.Header title="Select Sizes" subtitle={productTitle || ""} />
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
                onSubmit={_onSubmit}
            ></Modal.Footer>
        </Modal.Content>
    );
}
