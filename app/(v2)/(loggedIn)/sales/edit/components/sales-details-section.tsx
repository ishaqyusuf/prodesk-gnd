import { Label } from "@/components/ui/label";
import { useContext } from "react";
import { SalesFormContext } from "../ctx";
import SelectControl from "@/_v2/components/common/select-control";
import transformOptions from "@/_v2/lib/transform-option";
import { ISalesForm } from "../type";
import { FieldPath, FieldValues } from "react-hook-form";
import InputControl from "@/_v2/components/common/input-control";

export default function SalesDetailsSection() {
    const ctx = useContext(SalesFormContext);
    return (
        <div className="border-y my-2 py-1 grid gap-4 md:grid-cols-2 xl:grid-cols-5 gap-x-8">
            <div className="xl:col-span-3 grid gap-2 xl:grid-cols-2 xl:gap-x-4">
                <InfoLine label="Sales Rep:">
                    <span>{ctx?.data?.form?.salesRep?.name}</span>
                </InfoLine>
                <InfoLine label="Profile">
                    <SelectControl<ISalesForm>
                        name="meta.sales_profile"
                        options={transformOptions(
                            ctx.data.ctx.profiles,
                            "title",
                            "title"
                        )}
                        className="h-8 min-w-[150px]"
                        placeholder="Profile"
                    />
                </InfoLine>
                <InfoLine label="Q.B Order #">
                    <InputControl<ISalesForm>
                        className="h-8 w-[150px] uppercase"
                        name="meta.qb"
                    />
                </InfoLine>
                <InfoLine label="Delivery Option">
                    <SelectControl<ISalesForm>
                        name="deliveryOption"
                        options={["pickup", "delivery"]}
                        className="h-8 min-w-[150px]"
                        placeholder="Profile"
                    />
                </InfoLine>
                <InfoLine label="Mockup %">
                    <InputControl<ISalesForm>
                        className="h-8 w-[150px] uppercase"
                        type="number"
                        name="meta.mockupPercentage"
                    />
                </InfoLine>
            </div>
            <div className="xl:col-span-2"></div>
        </div>
    );
}
function InfoLine({ label, children }: { label?; children? }) {
    return (
        <div className="md:grid md:grid-cols-2 items-center xl:grid-cols-3">
            <Label className="text-muted-foreground whitespace-nowrap">
                {label}
            </Label>
            <div className="text-end flex justify-end text-sm xl:col-span-2">
                {children}
            </div>
        </div>
    );
}
