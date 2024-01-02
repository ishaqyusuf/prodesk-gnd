import { useContext } from "react";
import { DykeItemFormContext, useDykeForm } from "../../../form-context";
import { useFieldArray } from "react-hook-form";
import ShelfItemsBlock from "./shelf-items-block";

export default function ShelfItemIndex() {
    const item = useContext(DykeItemFormContext);
    const form = useDykeForm();

    const { fields, append } = useFieldArray({
        control: form.control,
        name: `items.${item.rowIndex}.shelfItems`,
    });

    return (
        <>
            {fields.map((field, index) => (
                <ShelfItemsBlock key={field.id} shelfIndex={index} />
            ))}
        </>
    );
}
