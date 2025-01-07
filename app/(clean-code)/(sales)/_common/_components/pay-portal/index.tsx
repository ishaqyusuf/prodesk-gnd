import Modal from "@/components/common/modal";
import { useEffect, useState } from "react";
import { customerStore } from "./store";
import {
    getCustomerOverviewUseCase,
    getCustomersSelectListUseCase,
} from "../../use-case/customer-use-case";
import SalesTab from "./sales-tab";
import { _modal } from "@/components/common/modal/provider";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import FormSelect from "@/components/common/controls/form-select";
import AutoComplete from "@/components/_v1/common/auto-complete";
import { toast } from "sonner";
import { usePayment } from "../overview-sheet/payments/payment-hooks";
import { TxForm } from "../tx-form";

export const openPayPortal = (phoneNo?) =>
    _modal.openSheet(<CustomerOverviewSheet phoneNo={phoneNo} />);
export default function CustomerOverviewSheet({ phoneNo }) {
    const store = customerStore();

    useEffect(() => {
        store.clear(phoneNo);
    }, []);
    useEffect(() => {
        if (store.phoneNo) {
            getCustomerOverviewUseCase(store.phoneNo).then((resp) => {
                resp.salesInfo.orders = resp.salesInfo?.orders?.filter(
                    (s) => s.amountDue
                );
                store.initialize(resp);
            });
        }
    }, [store.phoneNo]);
    return (
        <Modal.Content>
            {!store.phoneNo || store.loading ? (
                <>
                    <Modal.Header title="Select Customer" />
                    <CustomerSelect />
                </>
            ) : (
                <>
                    <Modal.Header
                        title={store.profile.displayName?.toUpperCase()}
                        subtitle={store.profile.phoneNo}
                    />
                    <SalesTab />
                    <TxForm />
                </>
            )}
        </Modal.Content>
    );
}
function CustomerSelect({}) {
    const s = customerStore();
    const form = useForm({
        defaultValues: {
            phoneNo: s.phoneNo,
        },
    });
    useEffect(() => {
        if (!s.customersList?.length)
            getCustomersSelectListUseCase().then((result) => {
                s.dotUpdate("customersList", result);
            });
    }, []);
    const phoneNo = form.watch("phoneNo");
    return (
        <Form {...form}>
            <div className="h-[90vh] flex flex-col sjustify-center items-centers">
                {/* <FormSelect
                    className="w-2/3s"
                    control={form.control}
                    name="phoneNo"
                    label={"Select Customer"}
                    options={s.customersList}
                /> */}
                <AutoComplete
                    onSelect={(value: any) => {
                        const phone = value.data?.value;
                        if (phone) s.dotUpdate("phoneNo", phone);
                        else toast.error("Customer must have phone no");
                    }}
                    itemText={"label"}
                    itemValue={"value"}
                    options={s.customersList}
                    form={form}
                    formKey={"phoneNo"}
                    label={"Select Customer"}
                    perPage={10}
                />
            </div>
        </Form>
    );
}
function Payment({}) {
    const ctx = customerStore();
    const payCtx = usePayment({});
}
