import { useContext } from "react";
import { SalesFormContext } from "../ctx";
import { useForm, useFormContext } from "react-hook-form";
import SalesAddressModal from "./sales-address-modal";
import { Button } from "@/components/ui/button";
import { openModal } from "@/lib/modal";

export default function SalesAddressSection() {
    const ctx = useContext(SalesFormContext);

    return (
        <div>
            <SalesAddressModal />
            <Button
                onClick={() => {
                    openModal("salesAddressForm");
                }}
            >
                Open
            </Button>
        </div>
    );
}
