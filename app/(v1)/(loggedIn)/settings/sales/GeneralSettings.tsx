import { useCustomerProfiles } from "@/_v2/hooks/use-static-data";
import ControlledInput from "@/components/common/controls/controlled-input";
import ControlledSelect from "@/components/common/controls/controlled-select";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAppSelector } from "@/store";
import { ISalesSetting } from "@/types/post";
import { UseFormReturn } from "react-hook-form";

export default function GeneralSettings({
    form,
}: {
    form: UseFormReturn<ISalesSetting>;
}) {
    const profiles = useCustomerProfiles();
    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">General Info</h3>
                <p className="text-sm text-muted-foreground">
                    Configure how you receive notifications.
                </p>
            </div>
            <Separator />
            <Form {...form}>
                <div className="grid grid-cols-2 gap-4">
                    <ControlledInput
                        type="number"
                        control={form.control}
                        name="meta.tax_percentage"
                        label="Tax Percentage (%)"
                    />
                    <ControlledInput
                        type="number"
                        control={form.control}
                        name="meta.ccc"
                        label="C.C.C (%)"
                    />
                    <ControlledSelect
                        options={[
                            { id: null, title: "None" },
                            ...(profiles?.data || []),
                        ]}
                        titleKey="title"
                        valueKey="id"
                        control={form.control}
                        name="meta.salesProfileId"
                        label="Default Customer Profile"
                    />
                </div>
            </Form>
        </div>
    );
}
