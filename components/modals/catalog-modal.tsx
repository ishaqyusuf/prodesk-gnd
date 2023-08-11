"use client";

import { useEffect, useState, useTransition } from "react";
import Btn from "../btn";
import { ScrollArea } from "../ui/scroll-area";
import BaseModal from "./base-modal";
import { IProduct, IProductVariant } from "@/types/product";
import { useDebounce } from "@/hooks/use-debounce";
import { loadCatalog } from "@/app/_actions/catalog";
import Money from "../money";
import { Icons } from "../icons";
import { useAppSelector } from "@/store";
import { dispatchSlice } from "@/store/slicers";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { ISalesOrder, ISalesOrderForm } from "@/types/sales";
import { closeModal, openModal } from "@/lib/modal";
import { openComponentModal } from "@/lib/sales/sales-invoice-form";
import { SalesFormCtx } from "@/app/_actions/sales-form";

interface Props {
  form: ISalesOrderForm;
  ctx: SalesFormCtx;
}
export default function CatalogModal({ form: bigForm, ctx }: Props) {
  const [products, setProducts] = useState<IProduct[]>([]);
  const sliceProducts = useAppSelector((state) => state.slicers.products);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [selection, setSelection] = useState<IProductVariant | null>(null);
  const debounceQuery = useDebounce(q, 800);
  useEffect(() => {
    setPage(1);
    search();
  }, [debounceQuery]);
  const [isPending, startTransition] = useTransition();
  async function search() {
    if (sliceProducts?.length > 0) return;
    startTransition(async () => {
      //   if (products.length > 0) return;

      const prods = await loadCatalog({
        page,
        q: debounceQuery,
      });
      setProducts([...products, ...(prods as IProduct[])]);
      dispatchSlice("products", [...products, ...(prods as IProduct[])]);
    });
  }
  const form = useForm<{
    title: string | null;
  }>({
    defaultValues: {
      title: "",
    },
  });
  useEffect(() => {
    setProducts([]);
    // search();
  }, []);
  function selectComponent() {
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
    console.log(rowIndex);
    closeModal();
    if (rowIndex > -1) {
      // const item: Partial<ISalesOrder> = ;
      const uuid = ctx.settings?.wizard?.form.filter(
        (f) => f.label == "Door"
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
                price: selection?.price || 0,
              },
            },
          },
        } as any,
        rowIndex
      );
    }
  }
  return (
    <BaseModal<any>
      onOpen={() => {
        search();
      }}
      modalName="catalog"
      className="sm:max-w-[500px]"
      Title={() =>
        selection ? (
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setSelection(null)}
              className="h-8 w-8 p-0"
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <span>Component Title</span>
          </div>
        ) : (
          <div>Product Catalog (Legacy)</div>
        )
      }
      Content={() =>
        !selection ? (
          <div className="flex flex-col">
            <ScrollArea className="max-h-[350px] text-sm">
              {sliceProducts.map((product) => (
                <table className="table-fixed w-full" key={product.id}>
                  <thead>
                    <tr>
                      <th
                        className="p-1  text-muted-foreground uppercase border-y border-slate-400 text-start"
                        colSpan={12}
                      >
                        {product.title}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variants?.map((variant, i) => (
                      <tr
                        onClick={() => {
                          const { variants, ...prod } = product;
                          setSelection({
                            ...variant,
                            product: prod as any,
                          });
                          form.setValue(
                            "title",
                            variant.meta?.componentTitle || variant.title
                          );
                        }}
                        className="cursor-pointer hover:bg-slate-100"
                        key={variant.id}
                      >
                        <td colSpan={2} />
                        <td
                          colSpan={8}
                          className={cn(i > 0 && "border-t border-slate-300")}
                        >
                          <p className="text-primary p-1">
                            <span className="">{variant.variantTitle}</span>
                            <span className="text-muted-foreground uppercase mx-2">
                              ({variant.sku})
                            </span>
                          </p>
                        </td>
                        <td
                          colSpan={2}
                          align="right"
                          className={cn(i > 0 && "border-t", "px-2")}
                        >
                          <Money value={variant.price} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ))}
            </ScrollArea>
            <div className="flex justify-center">
              {isPending && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="inline-flex">
              <div>
                {/* <p className="font-semibold">{selection.product.title}</p> */}
                <div className="flex justify-between">
                  <p>{selection.title}</p>
                  <p>
                    <Money value={selection.price} />
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="grid gap-2">
                <Label>Component Title</Label>
                <Input {...form.register("title")} />
              </div>
            </div>
          </div>
        )
      }
      noFooter={!selection}
      Footer={({ data }) => (
        <div>
          <Btn onClick={selectComponent}>Proceed</Btn>
        </div>
      )}
    />
  );
}
