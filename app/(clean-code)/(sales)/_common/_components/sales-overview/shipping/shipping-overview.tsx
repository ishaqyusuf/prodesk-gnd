import { SecondaryTabSheet } from "@/components/(clean-code)/data-table/item-overview-sheet";
import {
    ItemProdViewContext,
    useItemProdViewContext,
} from "../production/use-hooks";
import { Badge } from "@/components/ui/badge";
import { GetSalesOverview } from "../../../use-case/sales-item-use-case";
import { useForm } from "react-hook-form";
import { createContext, useContext, useEffect } from "react";
import { Form } from "@/components/ui/form";
import NumberPicker from "@/components/(clean-code)/custom/controlled/number-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    createSalesDispatchUseCase,
    SalesDispatchForm,
    salesDispatchFormUseCase,
} from "../../../use-case/sales-dispatch-use-case";
import { cn } from "@/lib/utils";
import Button from "@/components/common/button";
import { toast } from "sonner";
import ControlledSelect from "@/components/common/controls/controlled-select";
import { Label } from "@/components/ui/label";
let context = null;
const useShippingForm = (): ReturnType<typeof useShippingFormCtx> => {
    const ctx = useItemProdViewContext();
    const { mainCtx, item, payload } = ctx;
    const slug = mainCtx.tabData?.payloadSlug;
    if (context?.id == slug) return context;
    return useShippingFormCtx();
};
const useShippingFormCtx = () => {
    const ctx = useItemProdViewContext();
    const { mainCtx, item, payload } = ctx;
    const slug = mainCtx.tabData?.payloadSlug;

    const shipping = mainCtx.overview?.shipping?.list?.find(
        (ls) => ls.id == slug
    );
    const resp = {
        shipping,
        id: slug,
        mainCtx,
    };
    context = resp;
    return resp;
};
const ShippingFormCtx = createContext<ReturnType<typeof useShippingFormCtx>>(
    null as any
);

export function ShippingOverview({}) {
    const ctx = useShippingForm();
    const { mainCtx, shipping } = ctx;
    return (
        <ShippingFormCtx.Provider value={ctx}>
            <SecondaryTabSheet
                title={shipping.title}
                onBack={() => mainCtx.setTabData(null)}
            ></SecondaryTabSheet>
            <div className=""></div>
        </ShippingFormCtx.Provider>
    );
}
