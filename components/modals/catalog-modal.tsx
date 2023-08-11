"use client";

import { useEffect, useState, useTransition } from "react";
import Btn from "../btn";
import { ScrollArea } from "../ui/scroll-area";
import BaseModal from "./base-modal";
import { IProduct } from "@/types/product";
import { useDebounce } from "@/hooks/use-debounce";
import { loadCatalog } from "@/app/_actions/catalog";
import Money from "../money";
import { Icons } from "../icons";
import { useAppSelector } from "@/store";
import { dispatchSlice } from "@/store/slicers";

export default function CatalogModal() {
  const [products, setProducts] = useState<IProduct[]>([]);
  const sliceProducts = useAppSelector((state) => state.slicers.products);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
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
  useEffect(() => {
    setProducts([]);
    // search();
  }, []);
  return (
    <BaseModal<any>
      onOpen={() => {
        search();
      }}
      modalName="catalog"
      className="sm:max-w-[500px]"
      Title={() => <div>Product Catalog (Legacy)</div>}
      Content={() => (
        <div className="flex flex-col">
          <ScrollArea className="max-h-[350px] text-sm">
            {sliceProducts.map((product) => (
              <table className="table-fixed w-full mr-2" key={product.id}>
                <thead>
                  <tr>
                    <th
                      className="font-bold p-0.5 bg-slate-100 uppercase border text-start"
                      colSpan={12}
                    >
                      {product.title}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.variants?.map((variant) => (
                    <tr key={variant.id}>
                      <td colSpan={2} />
                      <td colSpan={8}>
                        <p className="text-primary">
                          <span className="font-semibold">
                            {variant.variantTitle}
                          </span>
                          (
                          <span className="text-muted-foreground">
                            {variant.sku}
                          </span>
                          )
                        </p>
                      </td>
                      <td colSpan={2} align="right">
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
      )}
      noFooter
    />
  );
}
