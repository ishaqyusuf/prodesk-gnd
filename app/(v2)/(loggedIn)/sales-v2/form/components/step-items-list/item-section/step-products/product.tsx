import { useEffect, useState, useTransition } from "react";
import { useDykeCtx, useDykeItemCtx } from "../../../../_hooks/form-context";
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
import { Dot } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useProdBatchAction } from "../../../../_hooks/use-prod-batch-action";
import DoorMenuOption from "./door-menu-option";

import { Button } from "@/components/ui/button";
import Img from "@/components/(clean-code)/img";
import stepHelpers from "@/app/(clean-code)/(sales)/sales-book/(form)/_utils/helpers/step-helper";
import { useLegacyDykeFormStep } from "@/app/(clean-code)/(sales)/sales-book/(form)/_hooks/legacy-hooks";
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
    products;
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
    products,
}: Props) {
    const ctx = useDykeItemCtx();
    const formCtx = useDykeCtx();
    const stepCtx = useLegacyDykeFormStep();
    const selected = isMultiSection
        ? ctx.multi.watchItemSelected(safeFormText(item.product.title))
        : false;
    const itemData = ctx.get.itemArray();

    const doorPriceCount = Object.entries(
        item.product.meta.doorPrice || {}
    ).filter(([k, v]) => {
        return v > 0 && k?.endsWith(itemData.item?.housePackageTool?.height);
    }).length;
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
            stepCtx.reloadComponents();
            // setStepProducts((prods) => {
            //     return [...prods].map((prod, index) => {
            //         if (prod.uid == item.uid)
            //             prod._metaData.price = Number(price);
            //         return prod;
            //     });
            // });
            menuOpenChange(false);
        });
    }
    const onEditPrice = async (e) => {
        e.preventDefault();
        setPrice(item._metaData.basePrice);
        setEditPrice(true);
    };
    const batchCtx = useProdBatchAction();
    function Content({ onClick }) {
        return (
            <>
                <CardHeader
                    onClick={onClick}
                    className="border-b realtive flex-1 p-0 py-4"
                >
                    <div className="absolute -m-4 z-10 left-0 top-0">
                        {item.productCode && (
                            <Badge variant="outline">#{item.productCode}</Badge>
                        )}
                    </div>
                    <div className="absolute p-2 z-10 px-4 top-0 right-0 flex gap-4">
                        {item.meta?.stepSequence?.length ? (
                            <Dot className="w-8 h-8 text-cyan-600" />
                        ) : null}
                        {stepForm.step.title == "Door" ? (
                            <span className="inline-flex space-x-1 text-muted-foreground">
                                {/* <Icons.dollar className="w-4 h-4" /> */}
                                <span>
                                    {doorPriceCount} {" price found"}
                                </span>
                            </span>
                        ) : (
                            item._metaData.basePrice > 0 && (
                                <div className="flex">
                                    {formCtx.adminMode && (
                                        <Badge variant="secondary">
                                            <Money
                                                value={item._metaData.basePrice}
                                            />
                                        </Badge>
                                    )}
                                    <Badge variant="destructive">
                                        <Money value={item._metaData.price} />
                                    </Badge>
                                </div>
                            )
                        )}
                    </div>

                    <ProductImage item={item} />
                    {/* <div className="absolute top-0"></div> */}
                </CardHeader>
                <CardContent
                    onClick={onClick}
                    className="space-y-1.5 inline-flex items-center justify-between p-2"
                >
                    {/* <span>{item.deletedAt ? "yes" : "no"}</span> */}
                    <CardTitle className="line-clamp-1s text-sm">
                        {isRoot
                            ? item.product?.value || item.product.title
                            : item.product.title}
                    </CardTitle>
                </CardContent>
            </>
        );
    }
    const [showProceed, setShowProceed] = useState(false);

    useEffect(() => {
        if (showProceed) {
            setTimeout(() => {
                setShowProceed(false);
            }, 3000);
        }
    }, [showProceed]);
    function MouldingContent() {
        return (
            <>
                <Content
                    onClick={() => {
                        setShowProceed(true);
                        if (!loadingStep && !menuOpen) select(selected, item);
                    }}
                />

                {showProceed && (
                    <div className="absolute">
                        <Button
                            onClick={() => {
                                select(false);
                            }}
                            size="sm"
                        >
                            Proceed
                        </Button>
                    </div>
                )}
            </>
        );
    }
    return (
        <Card
            className={cn(
                "size-full overflow-hiddens rounded-lg relative border-muted-foreground/10 flex flex-col flex-1",
                className,
                selected ? "hover:border-green-500 border-green-500" : "",
                loadingStep ? "cursor-not-allowed" : "cursor-pointer"
            )}
        >
            {/* {formCtx.superAdmin && <batchCtx.CheckBox uid={item.uid} />} */}

            <div
                className={cn(
                    !menuOpen && "hidden",
                    "absolute top-0 right-0  rounded-lg shadow-xl -m-4 bg-white z-20",
                    !formCtx.superAdmin ? "hidden" : "group-hover:flex"
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

                            {stepForm.step.title == "Door" ? (
                                <DoorMenuOption
                                    prod={item}
                                    setStepProducts={setStepProducts}
                                    products={products}
                                />
                            ) : (
                                <MenuItem
                                    onClick={onEditPrice}
                                    Icon={Icons.dollar}
                                >
                                    Change Price
                                </MenuItem>
                            )}

                            <DeleteRowAction
                                menu
                                noToast
                                row={item}
                                action={deleteStepItem}
                            />
                        </>
                    )}
                </Menu>
            </div>

            <span className="sr-only">
                {isRoot
                    ? item.product?.value || item.product.title
                    : item.product.title}
            </span>
            {stepForm.step?.title == "Moulding" ? (
                <MouldingContent />
            ) : (
                <Content
                    onClick={() => {
                        if (!loadingStep && !menuOpen) select(selected, item);
                    }}
                />
            )}
        </Card>
    );
}
interface ProductImageProps {
    item?;
    aspectRatio?;
}
export function ProductImage({ item, aspectRatio = 4 / 2 }: ProductImageProps) {
    const src = item.product.img || item?.product?.meta?.cld;
    const svg = (item.product.meta as any)?.svg;
    const url = item.product.meta?.url;
    return (
        <Img
            src={src}
            aspectRatio={
                src || url ? (item.isDoor ? 4 / 4 : aspectRatio) : aspectRatio
            }
            alt={item.product.title}
            svg={svg}
        />
    );
    return (
        <motion.div
            className="flex flex-1 h-full flex-col items-center space-y-2 justify-center relative "
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300 }}
        >
            {item.product.img || item?.product?.meta?.cld ? (
                <AspectRatio ratio={item.isDoor ? 4 / 4 : aspectRatio}>
                    <Image
                        src={`${env.NEXT_PUBLIC_CLOUDINARY_BASE_URL}/dyke/${
                            item.product.img || item?.product?.meta?.cld
                        }`}
                        alt={item.product.title}
                        className="object-contain"
                        // sizes="(min-width: 1024px) 10vw"
                        fill
                        loading="lazy"
                    />
                </AspectRatio>
            ) : (item.product.meta as any)?.svg ? (
                <AspectRatio ratio={1}>
                    <SVG className="" src={item.product.meta?.svg} />
                </AspectRatio>
            ) : item.product.meta?.url ? (
                <AspectRatio ratio={item.isDoor ? 4 / 4 : aspectRatio}>
                    <div className="absolute inset-0 bg-red-400 bg-opacity-0"></div>
                    <object
                        data={item.product.meta?.url}
                        type={"image/svg+xml"}
                        className=""
                        id="img"
                    />
                </AspectRatio>
            ) : (
                <PlaceholderImage className="rounded-none" asChild />
            )}
        </motion.div>
    );
}
