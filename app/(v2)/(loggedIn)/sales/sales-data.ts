import { textValue } from "@/lib/utils";

export default {
    delivery: [
        textValue("Pickup", "pickup"),
        textValue("Delivery", "delivery"),
    ] as ReturnType<typeof textValue>[],
    paymentTerms: [textValue("Net10"), textValue("Net20"), textValue("Net30")],
    addressTabs: [
        { value: "billingAddress", name: "Billing" },
        { value: "shippingAddress", name: "Shipping" },
    ],
};
