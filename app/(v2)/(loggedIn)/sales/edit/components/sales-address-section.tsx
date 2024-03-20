import { useContext } from "react";
import { SalesFormContext } from "../ctx";
import { useForm, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { openModal } from "@/lib/modal";
import { Icons } from "@/components/_v1/icons";
import { ISalesForm } from "../type";
import AddressDispaly from "../../_components/address-display";
import { useModal } from "@/components/common/modal-old/provider";
import SalesAddressModal from "./sales-address-modal";

export default function SalesAddressSection() {
    const form = useFormContext<ISalesForm>();
    const [shipping, billing, customer, customerId] = form.watch([
        "shippingAddress",
        "billingAddress",
        "customer",
        "customerId",
    ]);
    const modal = useModal();
    return (
        <>
            <div
                onClick={() => {
                    modal?.open(<SalesAddressModal form={form} />);
                }}
                className="xl:col-span-2 group cursor-pointer hover:shadow-sm relative  p-2 grid grid-cols-2 rounded-lg  hover:bg-accent-foreground hover:text-white"
            >
                <div className="absolute right-0 opacity-0 group-hover:opacity-100 ">
                    <Button size="sm" variant="secondary" className="h-8">
                        <Icons.edit className="h-3.5 w-3.5 " />
                    </Button>
                </div>
                <AddressDispaly address={billing} customer={customer} />
                <AddressDispaly
                    address={shipping}
                    type={"shipping"}
                    customer={customer}
                />
            </div>
        </>
    );
}
