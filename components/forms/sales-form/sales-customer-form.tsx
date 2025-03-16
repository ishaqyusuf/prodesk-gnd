import { useFormDataStore } from "@/app/(clean-code)/(sales)/sales-book/(form)/_common/_stores/form-data-store";

import { Command, CommandInput, CommandList } from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { useEffect, useMemo, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    AddressSearchType,
    searchAddressUseCase,
} from "@/app/(clean-code)/(sales)/_common/use-case/sales-address-use-case";
import { SearchAddressType } from "@/app/(clean-code)/(sales)/_common/data-access/sales-address-dta";
import Button from "@/components/common/button";
import { Icons } from "@/components/_v1/icons";
import { CustomerHistory } from "./customer-history";
export function SalesCustomerForm() {
    const zus = useFormDataStore();
    const md = zus.metaData;
    const [customer, setCustomer] = useState<SearchAddressType>(null);
    const onCustomerSelect = (customer: SearchAddressType) => {
        setCustomer(customer);
    };
    return (
        <div className="grid sm:grid-cols-2 font-mono gap-4 sm:gap-8">
            <div className="col-span-2 p-4">
                {!customer ? (
                    <SelectCustomer onSelect={onCustomerSelect}>
                        <Label className="cursor-pointer">
                            Select Customer...
                        </Label>
                    </SelectCustomer>
                ) : (
                    <div className="text-sm text-muted-foreground relative">
                        <p>{customer?.name}</p>
                        <p>{customer?.phoneNo}</p>
                        <p>{customer?.address1}</p>
                        <p>{/* {customer?.} */}</p>
                        <div className="absolute flex items-center -mr-5 top-0 right-0">
                            <SelectCustomer onSelect={onCustomerSelect}>
                                <Label className="cursor-pointer">Change</Label>
                            </SelectCustomer>

                            <Button size="xs" variant="link">
                                <Icons.edit className="size-3" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            <div className="col-span-2">
                <Label>Billing Address</Label>
            </div>
            <div className="col-span-2">
                <Label>Shipping Address</Label>
            </div>
            {customer?.id && <CustomerHistory customerId={customer?.id} />}
        </div>
    );
}
function SelectBilling({ children, onSelect }) {}
function SelectCustomer({ children, onSelect }) {
    const [q, setSearch] = useState("");
    const debouncedQuery = useDebounce(q, 800);
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<AddressSearchType[]>([]);
    useEffect(() => {
        if (debouncedQuery)
            searchAddressUseCase(debouncedQuery).then((res) => {
                setResult(res || []);
            });
    }, [debouncedQuery]);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                {children}
                {/* <Button
                    disabled={disabled}
                    aria-expanded={open}
                    size="sm"
                    variant="outline"
                    className="h-8"
                >
                    <Search className="h-4 w-4 text-muted-foreground" />
                </Button> */}
            </PopoverTrigger>
            <PopoverContent className="p-0" align="end">
                <Command shouldFilter={false}>
                    <CommandInput
                        value={q}
                        onValueChange={(v) => {
                            setSearch(v);
                        }}
                        placeholder="Search Address..."
                    />
                    <CommandList></CommandList>
                </Command>
                <ScrollArea className="max-h-[30vh] max-w-[400px] overflow-auto">
                    <div className="divide-y">
                        <button className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground space-y-1">
                            <Label className="text-sm font-medium text-primary truncate">
                                Create Customer
                            </Label>
                        </button>
                        {result?.map((address, key) => (
                            <button
                                key={key}
                                onClick={() => {
                                    onSelect(address);
                                    setOpen(false);
                                }}
                                className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground space-y-1"
                            >
                                <Label className="text-sm font-medium text-primary truncate">
                                    {address.name}
                                </Label>
                                <div className="text-xs text-muted-foreground truncate">
                                    {address.phoneAddress}
                                </div>
                                <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
                                    {address.taxProfile?.title && (
                                        <span className="px-1 py-0.5 bg-muted rounded text-muted-foreground">
                                            {address.taxProfile.title}
                                        </span>
                                    )}
                                    {address.salesProfile?.name && (
                                        <span className="px-1 py-0.5 bg-muted rounded text-muted-foreground">
                                            {address.salesProfile.name}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
