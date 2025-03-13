"react-hook-form";

import { NumberInput } from "@/components/currency-input";
import { useShelfItem } from "@/hooks/use-shelf";

export function ShelfQtyInput({ value, prodUid }) {
    const ctx = useShelfItem();

    return (
        <NumberInput
            value={value}
            onValueChange={(values) => {
                console.log({ aa: values.floatValue || null, values });
                ctx.dotUpdateProduct(prodUid, "qty", values.floatValue);
                // onChange(values.floatValue);
            }}
        />
    );
}
