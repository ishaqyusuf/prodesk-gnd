"use client";

import { SalesFormCtx } from "@/app/_actions/sales/sales-form";
import { useDebounce } from "@/hooks/use-debounce";
import {
    IProduct,
    IProductVariant,
    IProductVariantMeta
} from "@/types/product";
import { ISalesOrderForm } from "@/types/sales";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "../ui/button";
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "../ui/command";
import { cn, keyValue } from "@/lib/utils";
import Money from "../money";
import { loadCatalog } from "@/app/_actions/sales/catalog";
import { Skeleton } from "../ui/skeleton";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useForm } from "react-hook-form";
import { DialogFooter, DialogTitle } from "../ui/dialog";
import { ArrowLeft } from "lucide-react";
import Btn from "../btn";
import { updateInventoryComponentTitleAction } from "@/app/_actions/sales/inventory";
import { openComponentModal } from "@/lib/sales/sales-invoice-form";
import { DataTableFacetedFilter2 } from "../data-table/data-table-faceted-filter-2";
import { productCategories } from "@/data/product-category";
import { CatalogCommandDialog } from "../sales/command";

interface Props {
    form: ISalesOrderForm;
    ctx: SalesFormCtx;
}
export default function CatalogModal({ form: bigForm, ctx }: Props) {
    const router = useRouter();
    const [isOpen, setIsOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [category, setCategory] = React.useState("");
    const debouncedQuery = useDebounce(query, 300);
    const [products, setProducts] = React.useState<IProduct[]>([]);
    const [selection, setSelection] = React.useState<IProductVariant | null>(
        null
    );
    const [isPending, startTransition] = React.useTransition();

    const [page, setPage] = React.useState(1);
    const [lastPage, setLastPage] = React.useState(1);
    async function search() {
        // if (sliceProducts?.length > 0) return;
        // console.log("q", debouncedQuery);
        startTransition(async () => {
            //   if (products.length > 0) return;
            // console.log(debounceQuery);
            const { items, pageInfo } = await loadCatalog({
                page,
                q: debouncedQuery
            });
            setProducts([...products, ...(items as IProduct[])]);
            // console.log(items);
            setLastPage(pageInfo.pageCount);
            // dispatchSlice("products", [...products, ...(prods as IProduct[])]);
        });
    }
    const form = useForm<{
        title: string | null;
    }>({
        defaultValues: {
            title: ""
        }
    });
    function selectComponent() {
        startTransition(async () => {
            const items = bigForm.getValues("items");
            const len = items?.length || 0;
            let rowIndex = -1;
            for (let i = 0; i < len; i++) {
                if (rowIndex == -1) {
                    let itemIndex = i - 1;
                    let _item = items?.[itemIndex];
                    if (
                        !_item?.swing &&
                        !_item?.description &&
                        !_item?.qty &&
                        !_item?.total
                    ) {
                        rowIndex = itemIndex;
                    }
                }
            }
            const title = form.getValues("title");
            if (title != selection?.meta?.componentTitle)
                await updateInventoryComponentTitleAction({
                    title,
                    variantId: selection?.id,
                    meta: (selection?.meta || {}) as IProductVariantMeta
                });
            //  closeModal();
            setIsOpen(false);
            if (rowIndex > -1) {
                // const item: Partial<ISalesOrder> = ;
                const uuid = ctx.settings?.wizard?.form.filter(
                    f => f.label == "Door"
                )?.[0]?.uuid;
                openComponentModal(
                    {
                        meta: {
                            uid: rowIndex,
                            isComponent: true,
                            components: {
                                [uuid]: {
                                    title: form.getValues("title"),
                                    qty: 1,
                                    price: selection?.price || 0
                                }
                            }
                        }
                    } as any,
                    rowIndex
                );
            }
        });
    }
    React.useEffect(() => {
        search();
    }, [debouncedQuery]);

    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(isOpen => !isOpen);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);
    const handleSelect = React.useCallback((variant: IProductVariant) => {
        // setIsOpen(false);
        // callback();
        setSelection(variant);
        form.setValue("title", variant?.meta?.componentTitle || variant?.title);
    }, []);
    React.useEffect(() => {
        setPage(1);
        setProducts([]);
        setQuery("");
        form.reset({});
        setSelection(null);
        if (isOpen) search();
    }, [isOpen]);
    return (
        <>
            <Button size="sm" className="h-8" onClick={() => setIsOpen(true)}>
                Catalog
            </Button>
            <CatalogCommandDialog
                shouldFilter={false}
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                {!selection ? (
                    <>
                        <div className="relative">
                            <CommandInput
                                placeholder="Search catalog..."
                                value={query}
                                onValueChange={e => {
                                    setProducts([]);
                                    setPage(1);
                                    setQuery(e);
                                }}
                            />
                            <div className="absolutes hidden top-0 right-0 m-4 mx-12">
                                {/* <DataTableFacetedFilter2
                  title="Category"
                  options={productCategories}
                  single
                  value={category}
                  setValue={setCategory}
                /> */}
                            </div>
                        </div>
                        <CommandList className=" max-h-none   h-[80vh]">
                            <CommandEmpty
                                className={cn(
                                    isPending
                                        ? "hidden"
                                        : "py-6 text-center text-sm"
                                )}
                            >
                                No products found.
                            </CommandEmpty>
                            {isPending && products?.length == 0 ? (
                                <div className="space-y-1 overflow-hidden px-1 py-2">
                                    <Skeleton className="h-4 w-10 rounded" />
                                    <Skeleton className="h-8 rounded-sm" />
                                    <Skeleton className="h-8 rounded-sm" />
                                </div>
                            ) : (
                                <>
                                    {products?.map((product, pid) => (
                                        <CommandGroup
                                            key={`prod-${pid}`}
                                            className="capitalize  text-base text-primary"
                                            heading={product.title}
                                        >
                                            {product.variants?.map(
                                                (variant, vid) => (
                                                    <CommandItem
                                                        className="p-1 cursor-pointer"
                                                        key={`var-${vid}`}
                                                        onSelect={() =>
                                                            handleSelect(
                                                                variant
                                                            )
                                                        }
                                                    >
                                                        <div className="w-full grid grid-cols-12">
                                                            <span></span>
                                                            <div className="col-span-7">
                                                                <p className="text-sm font-medium leading-none">
                                                                    {
                                                                        variant.variantTitle
                                                                    }
                                                                </p>
                                                            </div>
                                                            <div className="col-span-2">
                                                                <span className="text-muted-foreground uppercase text-sm">
                                                                    {
                                                                        variant.sku
                                                                    }
                                                                </span>
                                                            </div>
                                                            <div className="col-span-2 font-medium text-base flex justify-end">
                                                                <Money
                                                                    value={
                                                                        variant.price
                                                                    }
                                                                />
                                                            </div>
                                                        </div>

                                                        {/* <div className="flex justify-between space-x-4">
                      <div>
                        <p>{variant.variantTitle}</p>
                        <span className="text-muted-foreground uppercase">
                          ({variant.sku})
                        </span>
                      </div>
                      <Money value={variant.price} />
                    </div> */}
                                                    </CommandItem>
                                                )
                                            )}
                                        </CommandGroup>
                                    ))}
                                    {lastPage > page && (
                                        <div className="flex justify-center my-2">
                                            <Btn
                                                className=""
                                                isLoading={isPending}
                                                onClick={() => {
                                                    setPage(page + 1);
                                                    search();
                                                }}
                                            >
                                                Load More
                                            </Btn>
                                        </div>
                                    )}
                                </>
                            )}
                        </CommandList>
                    </>
                ) : (
                    <CommandList>
                        <CommandGroup>
                            <div className="p-4 pt-2 space-y-4">
                                <div className="">
                                    <div className="flex -mx-2 items-center space-x-2">
                                        <Button
                                            onClick={() => setSelection(null)}
                                            className="h-8 w-8 p-0"
                                            variant="ghost"
                                        >
                                            <ArrowLeft className="h-4 w-4" />
                                        </Button>
                                        <DialogTitle>
                                            Component Title
                                        </DialogTitle>
                                    </div>
                                </div>
                                <div className="inline-flex">
                                    <div>
                                        {/* <p className="font-semibold">{selection.product.title}</p> */}
                                        <div className="flex justify-between">
                                            <p>{selection.title}</p>
                                            <p>
                                                <Money
                                                    value={selection.price}
                                                />
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="">
                                    <div className="grid gap-2">
                                        <Label>Component Title</Label>
                                        <Input {...form.register("title")} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <div>
                                        <Btn
                                            isLoading={isPending}
                                            onClick={selectComponent}
                                        >
                                            Proceed
                                        </Btn>
                                    </div>
                                </DialogFooter>
                            </div>
                        </CommandGroup>
                    </CommandList>
                )}
            </CatalogCommandDialog>
        </>
    );
}
