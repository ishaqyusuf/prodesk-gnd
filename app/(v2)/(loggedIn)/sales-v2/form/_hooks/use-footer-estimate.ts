"use client";

import { DykeDoorType } from "../../type";
import { useDykeForm } from "./form-context";

interface Props {
    price?;
    doorType: DykeDoorType;
    tax?: boolean;
}
export default function useFooterEstimate() {
    const form = useDykeForm();

    // form.getValues('')
    function updateFooterPrice(uid, { price, doorType, tax }: Props) {
        const footer = form.getValues("footer");
        footer.footerPricesJson = JSON.parse(footer.footerPrices);
        footer.footerPricesJson[uid] = {
            doorType,
            price,
            tax,
        };
        form.setValue(
            "footer.footerPrices",
            JSON.stringify(footer.footerPricesJson)
        );
    }
    return { updateFooterPrice };
}
