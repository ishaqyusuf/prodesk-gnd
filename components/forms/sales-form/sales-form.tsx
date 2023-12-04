"use client";
import { SalesFormResponse } from "@/app/_actions/sales/sales-form";
import { ISalesOrder, ISaveOrder } from "@/types/sales";
import { useForm } from "react-hook-form";
import { PrintOrderMenuAction } from "@/components/actions/order-actions";
import OrderPrinter from "@/components/print/order/order-printer";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { deepCopy } from "@/lib/deep-copy";
import { numeric } from "@/lib/use-number";
import { SalesOrderItems, SalesOrders } from "@prisma/client";
import { saveOrderAction } from "@/app/_actions/sales/sales";
import { useRouter } from "next/navigation";

import { SalesCustomerModal } from "@/components/modals/sales-address-modal";
import SalesInvoiceTable from "./sales-invoice-table";
import { store, useAppSelector } from "@/store";
import {
    calibrateLines,
    initInvoiceItems
} from "@/lib/sales/sales-invoice-form";

import CatalogModal from "@/components/modals/catalog-modal";
import { removeEmptyValues } from "@/lib/utils";

import InfoCard from "./sales-form-card";
import dayjs from "dayjs";
import { Switch } from "@/components/ui/switch";
import {
    resetFooterInfo,
    toggleMockup
} from "@/store/invoice-item-component-slice";
import { Label } from "@/components/ui/label";
import { Menu, MenuItem } from "@/components/data-table/data-table-row-actions";
import { Icons } from "@/components/icons";
import { openModal } from "@/lib/modal";
import UpdateSalesDate from "@/components/sales/update-sales-date";

interface Props {
    data: SalesFormResponse;
    newTitle;
    slug;
}
export default function SalesForm({ data, newTitle, slug }: Props) {
    const pageData: SalesFormResponse = useAppSelector(
        s => s.slicers.dataPage.data
    );
    const defaultValues: ISalesOrder = {
        ...data?.form
    };
    //old payment term
    const opTerm = data?.form?.paymentTerm;
    const form = useForm<ISalesOrder>({
        defaultValues
    });
    const router = useRouter();

    useEffect(() => {
        const confirmationMessage = "Are you sure you want to leave this page?";

        const handleBeforeUnload = e => {
            e.preventDefault();
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        };
        const handleClick = e => {
            console.log(">>>>>");
            e.preventDefault();
            const alert = confirm(
                "You may have some unsaved changes, Are you sure you want to proceed?"
            );
            console.log(alert);
            if (alert) router.push(e.target.getAttribute("href"));

            // window.removeEventListener("beforeunload", handleBeforeUnload);
            // You may perform additional actions before redirecting
            // router.push(e.target.getAttribute("href"));
        };

        const links = document.querySelectorAll("a");

        links.forEach(link => {
            link.addEventListener("click", handleClick);
        });

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            links.forEach(link => {
                link.removeEventListener("click", handleClick);
            });
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [data]);
    // const router = useRouter();
    // const handleClick = e => {
    //     console.log("REQ");
    //     e.preventDefault();
    // };
    // useEffect(() => {
    //     document.addEventListener("click", handleClick, { capture: true });

    //     return () =>
    //         document.removeEventListener("click", handleClick, {
    //             capture: true
    //         });
    // }, [, /* ... deps from Redux */ handleClick]);
    useEffect(() => {
        let resp = data;

        const _formData: any = resp?.form || { meta: {} };
        const { _items, footer } = initInvoiceItems(resp?.form?.items);

        store.dispatch(resetFooterInfo(footer));
        form.reset({
            ..._formData,
            items: _items
        });
        //  const _baseLink = estimate ? "/sales/estimates" : "/sales/orders";
        //  store.dispatch(
        //    setNav(
        //      [
        //        { title: estimate ? "Estimates" : "Orders", link: _baseLink },
        //        _formData.orderId &&
        //          !estimate && {
        //            title: _formData.orderId,
        //            link: "/sales/orders/" + _formData.orderId,
        //          },
        //        { title: _formData.orderId ? "Edit" : "New" },
        //      ].filter(Boolean) as any
        //    )
        //  );
    }, [data]);

    const watchOrderId = form.watch("orderId");
    const [isSaving, startTransition] = useTransition();
    async function save(and: "close" | "new" | "default" = "default") {
        try {
            startTransition(async () => {
                const formData = saveData();

                // console.log(formData);
                // try {
                const response = await saveOrderAction(formData);
                if (response.orderId) {
                    const type = response.type;
                    if (and == "close") router.push(`/sales/${type}s`);
                    else {
                        if (and == "new")
                            router.push(`/sales/${type}/new/form`);
                        else {
                            if (slug != response.orderId)
                                router.push(
                                    `/sales/${type}/${response.orderId}/form`
                                );
                        }
                    }
                }
                toast.success("Saved", {});
                // } catch (error) {
                //     console.log(error);
                // }
            });
        } catch (error) {
            console.log(error);
        }
        //  loader.action(async () => {
        //  });
    }
    function saveData(): ISaveOrder {
        let {
            id,
            items: _items,
            shippingAddress,
            billingAddress,
            customer,
            salesRep,
            ...formValues
        }: ISalesOrder = deepCopy(form.getValues());

        formValues.amountDue =
            Number(formValues.grandTotal || 0) - pageData.paidAmount;
        formValues.meta = removeEmptyValues(formValues.meta);
        const deleteIds: number[] = [];
        if (formValues.type == "order") {
            if (!id || formValues.paymentTerm != opTerm) {
                const ts = formValues.paymentTerm?.replace("Net", "");
                const term = Number(ts);
                if (term)
                    formValues.goodUntil = new Date(
                        dayjs()
                            .add(term, "D")
                            .toISOString()
                    );
            }
        }
        let items = calibrateLines(_items)
            ?.map(({ salesOrderId, ...item }, index) => {
                // delete (item as any)?.salesOrderId;
                if (!item.description && !item?.total) {
                    if (item.id) deleteIds.push(item.id);

                    return null;
                }

                return numeric<SalesOrderItems>(
                    ["qty", "price", "rate", "tax", "taxPercenatage", "total"],
                    item
                );
            })
            .filter(Boolean);

        return {
            id,
            order: numeric<SalesOrders>(
                ["grandTotal", "amountDue", "tax", "taxPercentage", "subTotal"],
                formValues
            ) as any,
            deleteIds,
            items: items as any
        };
    }
    const mockupMode = useAppSelector(
        state => state.orderItemComponent?.showMockup
    );
    const mockPercent = form.watch("meta.mockupPercentage");
    return (
        <div className="px-8">
            <OrderPrinter />
            {/* <AutoExpandInput /> */}
            <section id="header" className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">
                        {watchOrderId || newTitle}
                    </h2>
                </div>
                <div className="sitems-center flex space-x-2">
                    {(mockPercent || 0) > 0 && (
                        <div className="inline-flex items-center space-x-2">
                            <Label>Mockup Mode</Label>
                            <Switch
                                checked={mockupMode as any}
                                onCheckedChange={e => {
                                    store.dispatch(toggleMockup(e));
                                }}
                            />
                        </div>
                    )}
                    <UpdateSalesDate
                        sales={
                            data?.form || {
                                createdAt: new Date()
                            }
                        }
                        page="invoice"
                        onUpdate={date => {
                            form.setValue("createdAt", date);
                        }}
                    />
                    <CatalogModal form={form} ctx={data.ctx} />

                    <Menu
                        variant={"secondary"}
                        disabled={mockupMode}
                        label={"Save"}
                        Icon={null}
                    >
                        <MenuItem onClick={() => save()} Icon={Icons.save}>
                            Save
                        </MenuItem>
                        <MenuItem
                            onClick={() => save("close")}
                            Icon={Icons.saveAndClose}
                        >
                            Save & Close
                        </MenuItem>
                        <MenuItem onClick={() => save("new")} Icon={Icons.add}>
                            Save & New
                        </MenuItem>
                    </Menu>
                    <Menu Icon={Icons.more}>
                        <MenuItem
                            onClick={() => {
                                openModal("salesSupply");
                            }}
                        >
                            Supply
                        </MenuItem>
                        <PrintOrderMenuAction
                            link
                            row={{ id: form.getValues("id") } as any}
                        />
                        <PrintOrderMenuAction
                            mockup
                            link
                            row={{ id: form.getValues("id") } as any}
                        />
                        <PrintOrderMenuAction
                            pdf
                            row={{ id: form.getValues("id") } as any}
                        />
                    </Menu>
                </div>
            </section>
            <section
                id="topForm"
                className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5 gap-x-8"
            >
                <div className="xl:col-span-3">
                    <InfoCard data={data} form={form} />
                </div>
                <div className="xl:col-span-2">
                    <SalesCustomerModal
                        form={form}
                        profiles={data.ctx?.profiles}
                    />
                </div>
            </section>
            <section id="invoiceForm">
                <SalesInvoiceTable form={form} data={data} />
            </section>
        </div>
    );
}

function AutoExpandInput() {
    const [text, setText] = useState("");
    const [lineCount, setLineCount] = useState(1);
    useEffect(() => {
        const textarea: HTMLElement = document.querySelector(
            ".auto-expand-input"
        ) as any;
        if (!textarea) return;
        const adjustHeight = () => {
            textarea.style.height = "32px";
            if (textarea.scrollHeight > 50) {
                textarea.style.height = `${textarea.scrollHeight}px`;
            }
            console.log(textarea.scrollHeight);
        };

        textarea.addEventListener("input", adjustHeight);
        return () => {
            textarea.removeEventListener("input", adjustHeight);
        };
    }, []);
    const handleTextChange = event => {
        const newText = event.target.value;
        setText(newText);
        const newLineCount = newText.split("\n").length;
        setLineCount(newLineCount);
    };
    return (
        <div className="relative w-full">
            <textarea
                value={text}
                onChange={handleTextChange}
                className="auto-expand-input w-full h-[32px] resize-none overflow-hidden border p-0.5 rounded-md"
                placeholder="Type something..."
            />
            {lineCount}
        </div>
    );
}
