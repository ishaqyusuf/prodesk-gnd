import { useContext, useEffect, useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import Btn from "@/components/_v1/btn";
import { DykeStep } from "@/app/(v2)/(loggedIn)/sales-v2/type";
import { Info } from "@/components/_v1/info";
import { updateStepItemPrice } from "./_actions";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { PlaceholderImage } from "@/components/placeholder-image";
interface Props {
    item: IStepProducts[number];
    select;
    loadingStep;
    isMultiSection;
    isRoot;
    stepForm: DykeStep;
    stepIndex;
    openStepForm;
    setStepProducts;
    deleteStepItem;
    className?: string;
}
export function StepItem({
    item,
    select,
    loadingStep,
    isMultiSection,
    deleteStepItem,
    stepForm,
    stepIndex,
    openStepForm,
    setStepProducts,
    className,
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
    const [saving, startSaving] = useTransition();

    const dependecies = ctx.formStepArray
        .map((s) => ({
            uid: s.step.uid,
            label: s.step.title,
            value: s.item.value,
            prodUid: s.item.prodUid,
        }))
        .filter(
            (_, i) =>
                i < stepIndex && stepForm.step.meta?.priceDepencies?.[_.uid]
        );
    const uids = dependecies.map((s) => s.prodUid);
    const dependenciesUid = uids.length ? uids.join("-") : null;
    async function savePrice() {
        startSaving(async () => {
            // console.log(item.uid);

            await updateStepItemPrice({
                stepProductUid: item.uid,
                price: Number(price),
                dykeStepId: stepForm.step.id,
                dependenciesUid,
            });
            setStepProducts((prods) => {
                return [...prods].map((prod, index) => {
                    if (prod.uid == item.uid)
                        prod._estimate.price = Number(price);
                    return prod;
                });
            });
            menuOpenChange(false);
        });
    }
    const onEditPrice = async (e) => {
        e.preventDefault();
        setPrice(item._estimate.price);
        setEditPrice(true);
    };
    return (
        <Card
            className={cn(
                "size-full overflow-hiddens rounded-lg relative border-muted-foreground/10 flex flex-col flex-1",
                className,
                selected ? "hover:border-green-500 border-green-500" : "",
                loadingStep ? "cursor-not-allowed" : "cursor-pointer"
            )}
            onClick={() => {
                if (!loadingStep) select(selected, item);
            }}
        >
            <div
                className={cn(
                    !menuOpen && "hidden",
                    " group-hover:flex absolute top-0 right-0  rounded-lg shadow-xl -m-2 bg-white z-10"
                )}
            >
                <Menu open={menuOpen} onOpenChanged={menuOpenChange}>
                    {editPrice ? (
                        <div className="p-2 grid gap-2">
                            <div
                                className={cn(
                                    "grid",
                                    dependecies.length && "border-b pt-2",
                                    dependecies.length > 1 ? "grid-cols-2" : ""
                                )}
                            >
                                {dependecies.map((i) => (
                                    <Info key={i.label} label={i.label}>
                                        {i.value}
                                    </Info>
                                ))}
                            </div>
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
            <CardHeader className="border-b flex-1 p-0 py-4">
                <motion.div
                    className="flex flex-1  h-full flex-col items-center space-y-2 justify-center relative "
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 300 }}
                >
                    {item.product.img ? (
                        <AspectRatio ratio={4 / 2}>
                            <Image
                                src={`${env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/dyke/${item.product.img}`}
                                alt={item.product.title}
                                className="object-contain"
                                sizes="(min-width: 1024px) 10vw"
                                fill
                                loading="lazy"
                            />
                        </AspectRatio>
                    ) : (item.product.meta as any)?.svg ? (
                        <AspectRatio ratio={1}>
                            <SVG className="" src={item.product.meta?.svg} />
                        </AspectRatio>
                    ) : item.product.meta?.url ? (
                        <AspectRatio ratio={4 / 2}>
                            <object
                                data={item.product.meta?.url}
                                type={"image/svg+xml"}
                            />
                        </AspectRatio>
                    ) : (
                        <PlaceholderImage className="rounded-none" asChild />
                    )}
                </motion.div>
            </CardHeader>
            <span className="sr-only">
                {isRoot
                    ? item.product?.value || item.product.title
                    : item.product.title}
            </span>

            <CardContent className="space-y-1.5 p-4">
                <CardTitle className="line-clamp-1 text-sm">
                    {isRoot
                        ? item.product?.value || item.product.title
                        : item.product.title}
                </CardTitle>
                <CardDescription className="line-clamp-1">
                    {/* {formatPrice(product.price)} */}
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
                </CardDescription>
            </CardContent>
        </Card>
    );
    return (
        <Card className="relative border-muted-foreground/10 hover:border-muted-foreground  borno group ">
            <button
                disabled={loadingStep}
                className={cn(
                    "w-full rounded  flex h-[220px] overflow-hidden ",
                    selected ? "hover:border-green-500 border-green-500" : ""
                )}
                onClick={() => {
                    select(selected, item);
                }}
            >
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
        </Card>
    );
    return (
        <Card className="relative border-muted-foreground/10 hover:border-muted-foreground  borno group">
            <button
                disabled={loadingStep}
                className={cn(
                    "w-full     rounded  flex h-[180px] overflow-hidden ",
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
        </Card>
    );
}
