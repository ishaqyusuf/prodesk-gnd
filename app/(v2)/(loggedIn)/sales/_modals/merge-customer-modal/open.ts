import { openModal } from "@/lib/modal";
import { ICustomer } from "@/types/customers";

export const mergeCustomerModal = "mergeCustomerModal";
export function openMergeDuplicatesModal(customers: ICustomer[]) {
    openModal(mergeCustomerModal, {
        customers,
    });
}
