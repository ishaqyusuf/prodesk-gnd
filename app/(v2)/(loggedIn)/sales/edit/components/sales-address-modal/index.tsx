import BaseModal from "@/components/_v1/modals/base-modal";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useContext, useEffect, useState, useTransition } from "react";
import { useForm, useFormContext } from "react-hook-form";
import salesData from "../../../sales-data";
import InputControl from "@/_v2/components/common/input-control";
import { ISalesAddressForm } from "@/types/sales";
import AutoComplete from "@/components/_v1/common/auto-complete";
import { Label } from "@/components/ui/label";
import { _getCustomerSearchList } from "../../../_data-access/get-customer-search.dac";
import { ICustomer } from "@/types/customers";
import Btn from "@/components/_v1/btn";
import { SalesFormContext } from "../../ctx";
import { deepCopy } from "@/lib/deep-copy";
import { toast } from "sonner";
import { saveSalesAddressAction } from "../../../_actions/save-sales-address";
import { useModal } from "@/_v2/components/common/modal/provider";
import { usePathname } from "next/navigation";
import { DialogFooter } from "@/components/ui/dialog";

export default function SalesAddressModal({ form: mainForm }) {
    // const mainForm = useFormContext();
    // const ctx = useContext(SalesFormContext);
    const { billingAddress, shippingAddress, customer } = mainForm.getValues();
    const addressForm = useForm<ISalesAddressForm>({
        defaultValues: {
            sameAddress: billingAddress?.id == shippingAddress?.id,
            profile: {},
            billingAddress,
            shippingAddress,
            customer,
        },
    });
    const modal = useModal();
    const [tab, setTab] = useState("billingAddress");
    const checked = addressForm.watch("sameAddress");
    const [saving, startTransition] = useTransition();

    const path = usePathname();

    async function save() {
        const isDyke = path.includes("sales-v2");
        startTransition(async () => {
            const {
                billingAddress, //: ,
                shippingAddress, //: { customerId: scid, ...siad },
                customer,
                profile,
                ...formData
            } = deepCopy<any>(addressForm.getValues());
            if (!billingAddress?.name || !billingAddress.phoneNo) {
                toast.error("Name and Phone is required");
                return;
            }
            const { customerId, search, ...biad } = billingAddress || {};
            const {
                customerId: scid,
                search: ssea,

                ...siad
            } = shippingAddress || {};
            const _form = {
                ...formData,
                shippingAddress: siad,
                billingAddress: biad,
                // sameAddress: checked as any,
                customer,
            };
            // console.log(_form);
            const resp = await saveSalesAddressAction({ ..._form } as any);
            // console.log(resp);
            if (resp.ok) {
                const {
                    profileUpdate,
                    customerId,
                    billingAddressId,
                    shippingAddressId,
                    billingAddress,
                    shippingAddress,
                    customer,
                    ...ext
                } = resp.val;
                const respData = isDyke
                    ? {
                          "order.customerId": customerId,
                          "order.billingAddressId": billingAddressId,
                          "order.shippingAddressId": shippingAddressId,
                          shippingAddress,
                          billingAddress,
                          customer,
                      }
                    : {
                          customerId,
                          billingAddressId,
                          shippingAddressId,
                          billingAddress,
                          shippingAddress,
                          customer,
                      };
                // console.log(respData);
                // console.log(respData);
                // console.log(mainForm.getValues("customerId"));
                // mainForm.reset(respData, {
                //     keepValues: true,

                // });
                Object.entries(respData).map(([k, v]) => {
                    mainForm.setValue(k as any, v, {
                        shouldDirty: true,
                    });
                });
                // closeModal();
                modal?.close();
            }
        });
    }
    // const [checked, setChecked] = useState<boolean>(true);
    const tabs = salesData.addressTabs;
    const [customers, setCustomers] = useState<ICustomer[]>([]);
    useEffect(() => {
        (async () => {
            setCustomers((await _getCustomerSearchList()).items as any);
        })();
    }, []);
    return (
        <Form {...addressForm}>
            <Tabs defaultValue={tab} className="">
                <TabsList className="grid w-full grid-cols-2">
                    {tabs.map((t) => (
                        <TabsTrigger
                            key={t.name}
                            onClick={() => setTab("billingAddress")}
                            value={t.value}
                            disabled={checked && t.value == "shippingAddress"}
                        >
                            {t.name}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {tabs.map((t) => (
                    <TabsContent value={t.value} key={t.name}>
                        <AddressForm
                            customers={customers}
                            formKey={t.value as any}
                        />
                    </TabsContent>
                ))}
            </Tabs>
            <DialogFooter className="flex justify-end">
                <div className="flex-1 flex items-center justify-between">
                    <InputControl
                        label="Same as Shipping"
                        check
                        name="sameAddress"
                    />
                    <Btn onClick={save} isLoading={saving} size="sm">
                        Save
                    </Btn>
                </div>
            </DialogFooter>
            {/* <BaseModal
                className="sm:max-w-[550px]"
                modalName="salesAddressForm"
                Title={({ data }) => <div></div>}
                Subtitle={({ data }) => <div></div>}
                Content={({ data }) => (
                    <Tabs defaultValue={tab} className="">
                        <TabsList className="grid w-full grid-cols-2">
                            {tabs.map((t) => (
                                <TabsTrigger
                                    key={t.name}
                                    onClick={() => setTab("billingAddress")}
                                    value={t.value}
                                    disabled={
                                        checked && t.value == "shippingAddress"
                                    }
                                >
                                    {t.name}
                                </TabsTrigger>
                            ))}
                        </TabsList>
                        {tabs.map((t) => (
                            <TabsContent value={t.value} key={t.name}>
                                <AddressForm
                                    customers={customers}
                                    formKey={t.value as any}
                                />
                            </TabsContent>
                        ))}
                    </Tabs>
                )}
                Footer={({ data }) => (
                    <div className="flex-1 flex items-center justify-between">
                        <InputControl
                            label="Same as Shipping"
                            check
                            name="sameAddress"
                        />
                        <Btn onClick={save} isLoading={saving} size="sm">
                            Save
                        </Btn>
                    </div>
                )}
            /> */}
        </Form>
    );
}
function AddressForm({
    formKey,
    customers,
}: {
    formKey: "billingAddress" | "shippingAddress";
    customers;
}) {
    const form = useFormContext();
    const addressSelected = (e) => {
        const { data: address } = e as any;
        const { customer, businessName, search, ..._address } = address;
        form.setValue(formKey, _address);
        if (customer?.profile && formKey == "billingAddress")
            form.setValue("profile", customer.profile);
    };
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
                <div className="grid gap-2">
                    <Label>Search</Label>
                    <AutoComplete
                        allowCreate
                        options={customers}
                        itemText={"search"}
                        itemValue={"search"}
                        onSelect={addressSelected}
                    />
                </div>
            </div>
            <div className="col-span-2">
                <InputControl<ISalesAddressForm>
                    name="customer.businessName"
                    label="Business Name"
                />
            </div>
            <div className="col-span-2">
                <InputControl<ISalesAddressForm>
                    name={`${formKey}.name`}
                    label="Name"
                />
            </div>
            <InputControl<ISalesAddressForm>
                name={`${formKey}.phoneNo`}
                label="Phone (Primary)"
            />
            <InputControl<ISalesAddressForm>
                name={`${formKey}.email`}
                label="Email"
            />
            <div className="col-span-2">
                <InputControl<ISalesAddressForm>
                    name={`${formKey}.address1`}
                    label="Address"
                />
            </div>
            <InputControl<ISalesAddressForm>
                name={`${formKey}.phoneNo2`}
                label="Phone (Secondary)"
            />
            <InputControl<ISalesAddressForm>
                name={`${formKey}.city`}
                label="City"
            />
            <InputControl<ISalesAddressForm>
                name={`${formKey}.state`}
                label="State"
            />
            <InputControl<ISalesAddressForm>
                name={`${formKey}.meta.zip_code`}
                label="Zip Code"
            />
        </div>
    );
}
