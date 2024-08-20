"use client";

import { useFieldArray, useForm, UseFormReturn } from "react-hook-form";
import RenderForm from "@/_v2/components/common/render-form";
import ControlledInput from "@/components/common/controls/controlled-input";
import { FileUploader } from "@/components/common/file-uploader";
import { useEffect, useState, useTransition } from "react";
import { saveStepProduct } from "../../../_action/save-step-product";
import { _getMouldingSpecies } from "../_action";
import ControlledCheckbox from "@/components/common/controls/controlled-checkbox";
import { IStepProducts } from "../../step-items-list/item-section/component-products";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DykeForm } from "../../../../type";
import { getDimensionSizeList } from "../../../../dimension-variants/_actions/get-size-list";
import useFn from "@/hooks/use-fn";
import { getDykeSections } from "../../../../_actions/dyke-settings/get-dyke-sections";

import ControlledSelect from "@/components/common/controls/controlled-select";
import { Icons } from "@/components/_v1/icons";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ProductImage } from "../../step-items-list/item-section/component-products/product";
import Modal from "@/components/common/modal";
import { useModal } from "@/components/common/modal/provider";
import SaveProductForModal from "../save-product-for-modal";
import { cn, generateRandomString } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { CheckCheckIcon, CheckCircle2 } from "lucide-react";
import { _restoreStepItems } from "../../step-items-list/item-section/component-products/_actions";

interface Props {
    setStepProducts;
    products?: IStepProducts;
    k: string;
}
export default function RestoreComponentModal({
    products,
    setStepProducts,
    k,
}: Props) {
    useEffect(() => {}, []);
    const sections = useFn(getDykeSections);

    const [saving, startSaving] = useTransition();
    const modal = useModal();
    const form = useForm({
        defaultValues: {
            retoreProds: {},
        },
    });
    const [prods, setProds] = useState<IStepProducts>([]);
    const [query, setQuery] = useState("");
    const debouncedQuery = useDebounce(query, 300);
    useEffect(() => {
        let hProds = products.filter((p) => p._metaData.hidden);
        const escapedText = !debouncedQuery
            ? ""
            : debouncedQuery
                  ?.toString()
                  .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

        const pattern = new RegExp(escapedText, "i");
        hProds = hProds?.filter((option) => pattern.test(option.product.title));

        setProds(hProds);
    }, [debouncedQuery]);
    const [selection, setSelection] = useState([]);
    async function _restore() {
        let prods = [...products].filter((p) => selection.includes(p.uid));
        if (prods.length) {
            let _f = prods.map((p) => {
                if (p.deletedAt) {
                    p.meta = {};
                }
                if (!p.meta.show) p.meta.show = {};
                delete p?.meta?.deleted?.[k];
                p.deletedAt = null;
                p.meta.show[k] = true;
                p._metaData.hidden = false;
                return p;
            });
            await _restoreStepItems(_f);
            modal.close();
            toast("Restored");
            setStepProducts((current) => {
                return [...current].map((p, i) => {
                    let ps = _f.find((s) => s.uid == p.uid);
                    if (ps) return ps;
                    return p;
                });
            });
        } else {
            toast("Select atleast one product");
        }
    }
    function selectProduct(product) {
        setSelection((p) => {
            let _d = [...p];
            let _i = _d.includes(product.uid);
            if (_i) _d = _d.filter((s) => s != product.uid);
            else _d.push(product.uid);
            return _d;
        });
    }
    return (
        <RenderForm {...form}>
            <Modal.Content>
                <Modal.Header title="Restore Product" />
                <div>
                    <div>
                        <Input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search..."
                        />
                    </div>
                    <ScrollArea className="h-[450px]">
                        <div className="grid grid-cols-3 mt-4">
                            {prods.map((product) => (
                                <button
                                    onClick={() => selectProduct(product)}
                                    key={product.id}
                                    className="relative flex flex-col items-center hover:shadow-sm hover:border"
                                >
                                    <div
                                        className={cn(
                                            "absolute right-0 top-0 m-2",
                                            !selection.includes(product.uid) &&
                                                "hidden"
                                        )}
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <div className="w-2/3 h-16s overflow-hidden">
                                        <ProductImage
                                            aspectRatio={1 / 1}
                                            item={product}
                                        />
                                    </div>
                                    <div className="">
                                        <span className=" text-sm">
                                            {product.product.title}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </div>
                <Modal.Footer
                    submitText={`Restore (${selection.length})`}
                    onSubmit={_restore}
                />
            </Modal.Content>
        </RenderForm>
    );
}
