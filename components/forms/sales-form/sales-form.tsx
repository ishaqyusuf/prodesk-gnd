"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SalesFormResponse } from "@/app/_actions/sales/sales-form";
import { ISalesOrder, ISalesOrderMeta, ISaveOrder } from "@/types/sales";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { FolderClosed, MoreVertical, Plus, Save } from "lucide-react";
import { PrintOrderMenuAction } from "@/components/actions/order-actions";
import OrderPrinter from "@/components/print/order/order-printer";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { deepCopy } from "@/lib/deep-copy";
import { numeric } from "@/lib/use-number";
import { SalesOrderItems, SalesOrders } from "@prisma/client";
import { saveOrderAction } from "@/app/_actions/sales/sales";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/use-day";
import { SalesCustomerProfileInput } from "./customer-profile-input";
import { SalesCustomerModal } from "@/components/modals/sales-customer-modal";
import SalesInvoiceTable from "./sales-invoice-table";
import { store, useAppSelector } from "@/store";
import {
  calibrateLines,
  initInvoiceItems,
} from "@/lib/sales/sales-invoice-form";
import { Input } from "@/components/ui/input";

import CatalogModal from "@/components/modals/catalog-modal";
import { removeEmptyValues } from "@/lib/utils";
import Btn from "@/components/btn";
import InfoCard from "./info-card";
import dayjs from "dayjs";

import AutoComplete2 from "@/components/auto-complete-headless";
import { loadStaticList } from "@/store/slicers";
import { staticHomeModels } from "@/app/_actions/community/static-home-models";

interface Props {
  data: SalesFormResponse;
  newTitle;
  slug;
}
export default function SalesForm({ data, newTitle, slug }: Props) {
  const pageData: SalesFormResponse = useAppSelector(
    (s) => s.slicers.dataPage.data
  );

  const defaultValues: ISalesOrder = {
    ...data?.form,
  };
  //old payment term
  const opTerm = data?.form?.paymentTerm;
  const form = useForm<ISalesOrder>({
    defaultValues,
  });
  useEffect(() => {
    let resp = data;
    console.log(resp);
    const _formData: any = resp?.form || { meta: {} };

    form.reset({
      ..._formData,
      items: initInvoiceItems(resp?.form?.items),
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
  const router = useRouter();
  async function save(and: "close" | "new" | "default" = "default") {
    startTransition(async () => {
      const formData = saveData();
      // console.log(formData);

      const response = await saveOrderAction(formData);
      if (response.orderId) {
        const type = response.type;
        if (and == "close") router.push(`/sales/${type}s`);
        else {
          if (and == "new") router.push(`/sales/${type}/new/form`);
          else {
            if (slug != response.orderId)
              router.push(`/sales/${type}/${response.orderId}/form`);
          }
        }
      }
      toast.success("Saved", {});
    });
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
      ?.map((item, index) => {
        delete item.salesOrderId;
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
        [
          "discount",
          "grandTotal",
          "amountDue",
          "tax",
          "taxPercentage",
          "subTotal",
        ],
        formValues
      ) as any,
      deleteIds,
      items: items as any,
    };
  }
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
          <CatalogModal form={form} ctx={data.ctx} />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm">Save</Button>
              {/* isLoading={loader.isLoading} */}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
              <DropdownMenuItem onClick={() => save()}>
                <Save className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Save
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => save("close")}>
                <FolderClosed className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Save & Close
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => save("new")}>
                <Plus className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Save & New
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex data-[state=open]:bg-muted"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-[160px]">
              <PrintOrderMenuAction row={{ id: form.getValues("id") } as any} />
              <PrintOrderMenuAction
                pdf
                row={{ id: form.getValues("id") } as any}
              />
              {/* <DropdownMenuItem>
            <Carrot className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Catalog
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Banknote className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
            Apply Payment
          </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </section>
      <section
        id="topForm"
        className="mt-4 grid grid-cols-4 gap-x-8 xl:grid-cols-5"
      >
        <div className="col-span-2 ">
          <InfoCard data={data} form={form} />
        </div>
        <div className="col-span-2 ">
          <SalesCustomerModal form={form} profiles={data.ctx?.profiles} />
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
  const handleTextChange = (event) => {
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
