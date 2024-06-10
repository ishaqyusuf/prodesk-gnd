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
    const profiles = useAppSelector(
        (state) => state.slicers.staticCustomerProfiles
    );

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
                    <FormField
                        control={form.control}
                        name="meta.tax_percentage"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tax Percentage (%)</FormLabel>
                                <FormControl>
                                    <Input
                                        className=""
                                        type="number"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="meta.ccc"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>C.C.C (%)</FormLabel>
                                <FormControl>
                                    <Input
                                        className=""
                                        type="number"
                                        {...field}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="meta.sales_profile"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Default Customer Profile</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectGroup>
                                                {profiles?.map((profile, _) => (
                                                    <SelectItem
                                                        key={_}
                                                        value={profile.title}
                                                    >
                                                        {profile.title}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
            </Form>
        </div>
    );
}
