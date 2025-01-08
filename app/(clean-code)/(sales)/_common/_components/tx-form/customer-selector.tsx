import { useForm } from "react-hook-form";
import { txStore } from "./store";
import { getCustomersSelectListUseCase } from "../../use-case/customer-use-case";
import { useEffect } from "react";
import AutoComplete from "@/components/_v1/common/auto-complete";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";

export default function CustomerSelector({}) {
    const tx = txStore();
    const form = useForm({
        defaultValues: {
            phoneNo: tx.phoneNo || "",
        },
    });
    useEffect(() => {
        if (!tx.customers?.length)
            getCustomersSelectListUseCase().then((result) => {
                tx.dotUpdate("customers", result);
            });
    }, []);
    return (
        <div className="border-b">
            <Form {...form}>
                <AutoComplete
                    onSelect={(value: any) => {
                        const phone = value.data?.value;
                        if (phone) tx.dotUpdate("phoneNo", phone);
                        else toast.error("Customer must have phone no");
                    }}
                    itemText={"label"}
                    itemValue={"value"}
                    options={tx.customers}
                    size="sm"
                    form={form}
                    formKey={"phoneNo"}
                    label={"Select Customer"}
                    perPage={10}
                />
            </Form>
        </div>
    );
}
