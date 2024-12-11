import { Label } from "@/components/ui/label";
import { useFormDataStore } from "../../_common/_stores/form-data-store";
import { Input, LineSwitch, Select } from "./line-input";
import { useMemo } from "react";
import { SettingsClass } from "../../_utils/helpers/zus/zus-settings-class";
import salesData from "@/app/(clean-code)/(sales)/_common/utils/sales-data";
import { FieldPath } from "react-hook-form";
import { SalesFormZusData } from "@/app/(clean-code)/(sales)/types";
import { CustomerSearch } from "./customer-search";

export function FormDataPage({}) {
    const zus = useFormDataStore();
    const setting = useMemo(() => new SettingsClass(), []);
    const profiles = setting.salesProfiles();
    const taxList = setting.taxList();
    return (
        <div className="lg:max-w-5xl xl:max-w-4xl">
            <div className="grid p-4 grid-cols-2 gap-4 sm:gap-6">
                <div className="">
                    <Input label="Q.B Order #" name="metaData.qb" />
                </div>
                <div className="">
                    <Input label="P.O No" name="metaData.po" />
                </div>
                <div className="">
                    <Select
                        label={"Profile"}
                        onSelect={(e) => {
                            setting.salesProfileChanged();
                        }}
                        name="metaData.salesProfileId"
                        options={profiles}
                        titleKey="title"
                        valueKey="id"
                    />
                </div>
                <div className="">
                    <Select
                        label="Delivery"
                        name="metaData.deliveryMode"
                        options={salesData.deliveryModes}
                        titleKey="text"
                        valueKey="value"
                    />
                </div>
                <Select
                    label="Tax Profile"
                    name="metaData.tax.taxCode"
                    options={taxList}
                    titleKey="title"
                    valueKey="taxCode"
                    onSelect={(e) => {
                        setting.taxCodeChanged();
                    }}
                />
                <Select
                    label="Payment Method"
                    name="metaData.paymentMethod"
                    options={salesData.paymentOptions}
                    onSelect={(e) => {
                        setting.calculateTotalPrice();
                    }}
                />
                {/* <div className="col-span-2"></div> */}
                <Input
                    label="Sales Discount ($)"
                    type="number"
                    name="metaData.pricing.discount"
                />
                <Input
                    label="Labor Cost ($)"
                    type="number"
                    name="metaData.pricing.labour"
                />
                <div className="col-span-2 border-b"></div>
                <AddressForm addressType="billing" />
                <AddressForm addressType="shipping" />
            </div>
        </div>
    );
}
interface InputProps {
    name: FieldPath<SalesFormZusData["metaData"]["billing"]>;
    label?: string;
    namePrefix;
    disabled?;
}
function AddressInput({ name, namePrefix, disabled, label }: InputProps) {
    // const namePrefix = addressType;
    return (
        <Input
            disabled={disabled}
            label={label}
            name={`metaData.${namePrefix}.${name}` as any}
        />
    );
}
function AddressForm({ addressType }) {
    const config = {
        billing: {
            title: "Billing Address",
        },
        shipping: {
            title: "Shipping Address",
        },
    }[addressType];
    const zus = useFormDataStore();

    const isShipping = addressType == "shipping";
    const sameAddress = zus.metaData?.samesAddress;
    const isBusiness = zus.metaData?.customer?.isBusiness;
    const namePrefix = isShipping && sameAddress ? "billing" : addressType;
    const disabled = isShipping && sameAddress;
    return (
        <div className="mt-2">
            <div className="border-b h-10 flex gap-2 items-center">
                <Label className="text-xl">{config.title}</Label>
                <div className="flex-1"></div>
                <CustomerSearch addressType={addressType} />
                <div className="flex items-center gap-2">
                    {isShipping ? (
                        <>
                            <Label>Same as Billing</Label>
                            <LineSwitch name="metaData.samesAddress" />
                        </>
                    ) : (
                        <>
                            <Label>Business</Label>
                            <LineSwitch name="metaData.customer.isBusiness" />
                        </>
                    )}
                </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4">
                {!isShipping && isBusiness ? (
                    <div className="col-span-2">
                        <Input
                            label="Business Name"
                            name="metaData.customer.businessName"
                        />
                    </div>
                ) : (
                    <div className="col-span-2">
                        <AddressInput
                            disabled={disabled}
                            namePrefix={namePrefix}
                            label="Customer Name"
                            name="name"
                        />
                    </div>
                )}
                <AddressInput
                    disabled={disabled}
                    namePrefix={namePrefix}
                    label="Primary Phone"
                    name="primaryPhone"
                />
                <AddressInput
                    disabled={disabled}
                    namePrefix={namePrefix}
                    label="Email"
                    name="email"
                />
                <div className="col-span-2">
                    <AddressInput
                        disabled={disabled}
                        namePrefix={namePrefix}
                        label="Address"
                        name="address1"
                    />
                </div>
                <AddressInput
                    disabled={disabled}
                    namePrefix={namePrefix}
                    label="Secondary Phone"
                    name="secondaryPhone"
                />
                <AddressInput
                    disabled={disabled}
                    namePrefix={namePrefix}
                    label="State"
                    name="state"
                />
                <AddressInput
                    disabled={disabled}
                    namePrefix={namePrefix}
                    label="City"
                    name="city"
                />
                <AddressInput
                    disabled={disabled}
                    namePrefix={namePrefix}
                    label="Zip Code"
                    name="zipCode"
                />
            </div>
        </div>
    );
}
