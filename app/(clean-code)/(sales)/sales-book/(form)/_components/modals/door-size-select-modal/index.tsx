import Modal from "@/components/common/modal";

import { createContext, useContext, useMemo } from "react";
import { useForm } from "react-hook-form";

import { Form } from "@/components/ui/form";

import { _modal } from "@/components/common/modal/provider";
import { toast } from "sonner";
import { ComponentHelperClass } from "../../../_utils/helpers/zus/zus-helper-class";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import ControlledInput from "@/components/common/controls/controlled-input";
import { saveComponentPricingUseCase } from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-pricing-use-case";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Props {
    cls: ComponentHelperClass;
}

const Context = createContext<ReturnType<typeof useInitContext>>(null);
const useCtx = () => useContext(Context);
const pricingOptions = ["Single Pricing", "Multi Pricing"] as const;
type PricingOption = (typeof pricingOptions)[number];
export function openDoorSizeSelectModal(cls: ComponentHelperClass) {
    _modal.openModal(<DoorSizeSelectModal cls={cls} />);
}
export function useInitContext(cls: ComponentHelperClass) {
    const priceModel = cls.getDoorPriceModel();
    console.log(priceModel);

    const sizeList = priceModel.sizeList.filter(
        (s) => s.height == priceModel.height
    );
    let groupItem = cls.getItemForm().groupItem;
    // if(!groupItem)
    // {
    //     groupItem = {
    //         itemIds: [],
    //         stepUid: cls.stepUid
    //     },
    //     form: {

    //     }
    // }
    const componentUid = cls.componentUid;
    const selections: {
        [id in string]: {
            salesPrice: number | string;
            basePrice: number;
            swing: string;
            qty: {
                lh: number | string;
                rh: number | string;
                total: number | string;
            };
        };
    } = {};
    console.log({ sizeList });
    const sList = sizeList.map((sl) => {
        const path = `${componentUid}-${sl.size}`;
        const sizeData = groupItem?.form?.[path];
        selections[path] = {
            salesPrice: sizeData?.salesPrice || "",
            basePrice: sizeData?.basePrice,
            swing: sizeData?.swing || "",
            qty: {
                lh: sizeData?.qty?.lh || "",
                rh: sizeData?.qty?.rh || "",
                total: sizeData?.qty?.total || "",
            },
        };
        return {
            path,
            ...sl,
        };
    });
    const form = useForm({
        defaultValues: {
            selections,
        },
    });
    async function save() {
        const data = form.getValues();
        const oldPv = priceModel.formData.priceVariants;
        // const priceUpdate = await saveComponentPricingUseCase(
        //     Object.entries(data.priceVariants)
        //         .filter(([k, val]) => {
        //             const prevPrice = oldPv?.[k]?.price;
        //             return val?.price != prevPrice;
        //         })
        //         .map(([dependenciesUid, _data]) => ({
        //             id: _data.id,
        //             price: _data.price ? Number(_data.price) : null,
        //             dependenciesUid,
        //             dykeStepId: data.dykeStepId,
        //             stepProductUid: data.stepProductUid,
        //         }))
        // );
        // await cls.fetchUpdatedPrice();
        // _modal.close();
        // toast.success("Pricing Updated.");
    }

    return {
        form,
        // priceModel: memoied.priceModel,
        cls,
        save,
        sizeList: sList,
    };
}
export default function DoorSizeSelectModal({ cls }: Props) {
    const ctx = useInitContext(cls);

    return (
        <Context.Provider value={ctx}>
            <Modal.Content>
                <Modal.Header
                    title={ctx.cls?.getComponent?.title || "Component Price"}
                    subtitle={"Edit door size price"}
                />
                <Form {...ctx.form}>
                    <ScrollArea
                        tabIndex={-1}
                        className="max-h-[50vh] px-4 -mx-4"
                    >
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Size</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Swing</TableHead>
                                    <TableHead>RH</TableHead>
                                    <TableHead>LH</TableHead>
                                    <TableHead>Qty</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ctx.sizeList?.map((variant, index) => (
                                    <Row key={index} variant={variant} />
                                ))}
                            </TableBody>
                        </Table>
                    </ScrollArea>
                </Form>
                <Modal.Footer submitText="Save" onSubmit={ctx.save} />
            </Modal.Content>
        </Context.Provider>
    );
}
function Row({ variant }) {
    const ctx = useCtx();
    const [salesPrice, basePrice] = ctx.form.watch([
        `selections.${variant.path}.salesPrice`,
        `selections.${variant.path}.basePrice`,
    ]);
    return (
        <TableRow>
            <TableCell>
                <Label>{variant.size}</Label>
            </TableCell>
            <TableCell>{}</TableCell>
            {/* <div className="flex-1">
                                            <Label className="">
                                                {variant.size}
                                            </Label>
                                        </div>
                                        <div className="w-28">
                                            <ControlledInput
                                                prefix="$"
                                                tabIndex={index + 50}
                                                control={ctx.form.control}
                                                size="sm"
                                                name={`selections.${variant.path}.qty.total`}
                                            />
                                        </div> */}
        </TableRow>
    );
}
