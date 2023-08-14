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
import { useEffect, useTransition } from "react";
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
import { store } from "@/store";
import { initInvoiceItems } from "@/lib/sales/sales-invoice-form";
import { Input } from "@/components/ui/input";
import {
  Form,
  // Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { openModal } from "@/lib/modal";
import CatalogModal from "@/components/modals/catalog-modal";
import { removeEmptyValues } from "@/lib/utils";

interface Props {
  data: SalesFormResponse;
  newTitle;
  slug;
}
export default function SalesForm({ data, newTitle, slug }: Props) {
  const defaultValues: ISalesOrder = {
    ...data?.form,
  };
  const form = useForm<ISalesOrder>({
    defaultValues,
  });
  useEffect(() => {
    let resp = data;

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
      console.log(formData);

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
      toast.message("Saved", {});
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
    if (!id) formValues.amountDue = formValues.grandTotal;
    formValues.meta = removeEmptyValues(formValues.meta);
    const deleteIds: number[] = [];
    let items = _items
      ?.map((item, index) => {
        if (!item.description && !item?.total) {
          if (item.id) deleteIds.push(item.id);
          return null;
        }
        item.meta = removeEmptyValues({
          ...(item.meta as any),
          line_index: index,
        });
        return numeric<SalesOrderItems>(
          ["qty", "price", "rate", "tax", "taxPercenatage", "total"],
          item
        );
      })
      .filter(Boolean);
    console.log(items);
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
              <PrintOrderMenuAction row={{ slug } as any} />
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
          <OrderPrinter />
        </div>
      </section>
      <section
        id="topForm"
        className="mt-4 grid grid-cols-4 gap-x-8 xl:grid-cols-5"
      >
        <div className="col-span-2 ">
          <div className="group relative  h-full w-full  rounded border border-slate-300 p-2 text-start hover:bg-slate-100s hover:shadows">
            <div className="space-y-1">
              {orderInformation.map((line, key) => (
                <div
                  key={key}
                  className="items-start md:grid md:grid-cols-2 xl:grid-cols-3"
                >
                  <Label className="text-muted-foreground">{line.label}</Label>

                  <div className="text-end text-sm xl:col-span-2">
                    {key == 0 && (
                      <SalesCustomerProfileInput
                        form={form}
                        profiles={data?.ctx?.profiles}
                      />
                    )}
                    {key == 1 && (
                      <div className="flex justify-end">
                        <Input
                          className="h-6 w-[100px] uppercase"
                          {...form.register("meta.qb")}
                        />
                      </div>
                    )}
                    {key > 1 && (
                      <div>
                        {line.key == "prodDueDate"
                          ? formatDate(form.getValues(line.key))
                          : form.getValues(line.key as any) ?? "-"}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* </OrderEditInfo> */}
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

export const orderInformation: {
  label: string;
  key: string; //: keyof ISalesOrder;
  value?: any;
}[] = [
  {
    label: "Profile",
    key: "meta.sales_profile",
    value: "",
  },
  { label: "Q.B Order #.", key: "meta.qb" },
  { label: "Sales Rep.", key: "meta.rep" },
  { label: "P.O No.", key: "meta.po" },
  { label: "Good Until", key: "meta.good_until" },
  { label: "Due Date", key: "prodDueDate" },
];
