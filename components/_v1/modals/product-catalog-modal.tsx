"use client";

import React, { useTransition } from "react";

import { useRouter } from "next/navigation";

import { _useAsync } from "@/lib/use-async";
import Btn from "../btn";
import BaseModal from "./base-modal";
import { closeModal } from "@/lib/modal";
import { toast } from "sonner";

import { useForm } from "react-hook-form";

import { Input } from "../../ui/input";
import { Label } from "../../ui/label";

import { useAppSelector } from "@/store";
import { IUser } from "@/types/hrm";
import AutoComplete2 from "../auto-complete";
import { employeeSchema } from "@/lib/validations/hrm";

import { IProduct, IProductVariant } from "@/types/product";
import { createProductAction } from "@/app/(v1)/_actions/sales-products/crud";

export default function ProductCatalogModal() {
    const route = useRouter();
    const [isSaving, startTransition] = useTransition();
    const form = useForm<{
        product: IProduct;
        variant: IProductVariant;
    }>({
        defaultValues: {},
    });
    async function submit(data) {
        startTransition(async () => {
            // if(!form.getValues)
            try {
                // const isValid = employeeSchema.parse(form.getValues());
                const fd = form.getValues();
                const pid = products.find(
                    (p) =>
                        p.title?.toLowerCase() ===
                        fd.product.title?.toLowerCase()
                )?.id;
                await createProductAction(
                    {
                        id: pid,
                        title: fd.product.title,
                        category: fd.product.category,
                    },
                    {
                        price: Number(fd.variant.price),
                        variantTitle: fd.variant.variantTitle,
                    }
                );
                closeModal();
                toast.message("Success!");
                route.refresh();
            } catch (error) {
                console.log(error);
                toast.message("Invalid Form");
                return;
            }
        });
    }
    const categories = useAppSelector(
        (state) => state?.slicers?.staticProductCategories
    );
    const products = useAppSelector((s) => s.slicers.staticProducts);
    async function init(data) {
        form.reset(
            !data
                ? {}
                : {
                      ...data,
                  }
        );
    }
    return (
        <BaseModal<IUser | undefined>
            className="sm:max-w-[550px]"
            onOpen={(data) => {
                init(data);
            }}
            onClose={() => {}}
            modalName="product"
            Title={({ data }) => (
                <div>
                    {data?.id ? "Edit" : "Create"}
                    {" Product"}
                </div>
            )}
            Content={({ data }) => (
                <div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="grid gap-2 col-span-2">
                            <Label>Product</Label>
                            <AutoComplete2
                                form={form}
                                allowCreate
                                options={products}
                                itemText={"title"}
                                itemValue={"title"}
                                formKey={"product.title"}
                                placeholder=""
                                className="h-8"
                            />
                        </div>
                        <div className="grid gap-2 col-span-2">
                            <Label>Variant</Label>
                            <Input
                                placeholder=""
                                className="h-8"
                                {...form.register("variant.variantTitle")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Price ($)</Label>
                            <Input
                                className="h-8"
                                type="number"
                                {...form.register("variant.price")}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label>Category</Label>
                            <AutoComplete2
                                form={form}
                                itemText={"category"}
                                itemValue={"category"}
                                formKey={"product.category"}
                                className="h-8"
                                options={categories}
                                uppercase
                                allowCreate
                            />
                        </div>
                    </div>
                </div>
            )}
            Footer={({ data }) => (
                <Btn
                    isLoading={isSaving}
                    onClick={() => submit(data)}
                    size="sm"
                    type="submit"
                >
                    Save
                </Btn>
            )}
        />
    );
}
