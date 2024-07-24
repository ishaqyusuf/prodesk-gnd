import {
    startTransition,
    useContext,
    useEffect,
    useState,
    useTransition,
} from "react";
import { DykeItemFormContext } from "../../../../_hooks/form-context";
import { cn, safeFormText } from "@/lib/utils";
import Image from "next/image";
import { env } from "@/env.mjs";
import SVG from "react-inlinesvg";
import { Label } from "@/components/ui/label";
import Money from "@/components/_v1/money";
import { IStepProducts } from ".";
import { Icons } from "@/components/_v1/icons";
import {
    DeleteRowAction,
    Menu,
    MenuItem,
} from "@/components/_v1/data-table/data-table-row-actions";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Btn from "@/components/_v1/btn";
import { DykeStep } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { Info } from "@/components/_v1/info";
import { updateStepItemPrice } from "./_actions";
interface Props {
    item: IStepProducts[number];
    select;
    loadingStep;
    isMultiSection;
    isRoot;
    stepForm: DykeStep;
    openStepForm;
    deleteStepItem;
}
export function StepItem({
    item,
    select,
    loadingStep,
    isMultiSection,
    deleteStepItem,
    stepForm,
    openStepForm,
    isRoot,
}: Props) {
    const ctx = useContext(DykeItemFormContext);

    const selected = isMultiSection
        ? ctx.multi.watchItemSelected(safeFormText(item.product.title))
        : false;
    const doorPriceCount = Object.keys(
        item.product.meta.doorPrice || {}
    ).length;
    const [menuOpen, menuOpenChange] = useState(false);
    const [editPrice, setEditPrice] = useState(false);
    useEffect(() => {
        if (!menuOpen) setEditPrice(false);
    }, [menuOpen]);
    const [price, setPrice] = useState();
    const [info, setInfo] = useState([]);
    const [saving, startSaving] = useTransition();
    const dependenciesUid = "";
    ctx.formStepArray;
    async function savePrice() {
        startSaving(async () => {
            console.log(ctx.formStepArray);
            return;
            // menuOpenChange(false);
            await updateStepItemPrice({
                stepProductUid: stepForm.step.uid,
                price,
                dykeStepId: stepForm.step.id,
                dependenciesUid,
            });
        });
    }
    const onEditPrice = async (e) => {
        e.preventDefault();
        setPrice(item._estimate.price);
        setEditPrice(true);
    };
    return (
        <div className="relative p-4 group">
            <div
                className={cn(
                    !menuOpen && "hidden",
                    " group-hover:flex absolute top-0 right-0  rounded-lg shadow-xl -m-2 bg-white z-10"
                )}
            >
                <Menu open={menuOpen} onOpenChanged={menuOpenChange}>
                    {editPrice ? (
                        <div className="p-2 grid gap-2">
                            {info.map((i) => (
                                <Info key={i.label} label={i.label}>
                                    {i.title}
                                </Info>
                            ))}
                            <div className="grid gap-2">
                                <Label>Price</Label>
                                <Input
                                    type="number"
                                    value={price}
                                    onChange={(e) =>
                                        setPrice(e.target.value as any)
                                    }
                                />
                            </div>
                            <div className="flex justify-end">
                                <Btn
                                    onClick={savePrice}
                                    isLoading={saving}
                                    size="sm"
                                >
                                    Save
                                </Btn>
                            </div>
                        </div>
                    ) : (
                        <>
                            <MenuItem
                                onClick={() => openStepForm(item)}
                                Icon={Icons.edit}
                            >
                                Edit
                            </MenuItem>
                            <MenuItem onClick={onEditPrice} Icon={Icons.dollar}>
                                Change Price
                            </MenuItem>
                            <DeleteRowAction
                                menu
                                row={item}
                                action={deleteStepItem}
                            />
                        </>
                    )}
                </Menu>
            </div>
            <button
                disabled={loadingStep}
                className={cn(
                    "w-full  border-2 border-muted-foreground/10 hover:border-muted-foreground rounded  flex h-[180px] overflow-hidden ",
                    selected ? "hover:border-green-500 border-green-500" : ""
                )}
                onClick={() => {
                    select(selected, item);
                }}
            >
                <motion.div
                    className="flex flex-1 p-2 h-full flex-col items-center space-y-2 justify-end relative "
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {item.product.img ? (
                        <Image
                            className="cursor-pointer"
                            width={100}
                            height={100}
                            src={`${env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/dyke/${item.product.img}`}
                            alt={item.product.description || item.product.value}
                        />
                    ) : (item.product.meta as any)?.svg ? (
                        <SVG src={item.product.meta?.svg} />
                    ) : item.product.meta?.url ? (
                        <object
                            data={item.product.meta?.url}
                            type={"image/svg+xml"}
                        />
                    ) : null}
                    <Label className="text-sm">
                        {isRoot
                            ? item.product?.value || item.product.title
                            : item.product.title}
                    </Label>
                </motion.div>
                <div className="text-xs absolute top-0 right-0 p-4 px-8 font-bold mt-2">
                    {stepForm.step.title == "Door" ? (
                        <span className="inline-flex space-x-1 text-muted-foreground">
                            {doorPriceCount > 0 && (
                                <>
                                    <Icons.dollar className="w-4 h-4" />
                                    <span>{doorPriceCount}</span>
                                </>
                            )}
                        </span>
                    ) : (
                        item._estimate.price > 0 && (
                            <Money value={item._estimate.price} />
                        )
                    )}
                </div>
            </button>
        </div>
    );
}
