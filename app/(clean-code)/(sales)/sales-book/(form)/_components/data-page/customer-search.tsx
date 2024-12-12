import {
    AddressSearchType,
    getAddressFormUseCase,
    searchAddressUseCase,
} from "@/app/(clean-code)/(sales)/_common/use-case/sales-address-use-case";
import { Menu } from "@/components/(clean-code)/menu";
import { Icons } from "@/components/_v1/icons";
import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDebounce } from "@/hooks/use-debounce";
import { Search, SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useFormDataStore } from "../../_common/_stores/form-data-store";
import {
    AddressForm,
    SalesFormZusData,
} from "@/app/(clean-code)/(sales)/types";

interface Props {
    addressType: string;
}
export function CustomerSearch({ addressType }) {
    const [q, setSearch] = useState("");
    const debouncedQuery = useDebounce(q, 800);
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<AddressSearchType[]>([]);
    const zus = useFormDataStore();
    const disabled = addressType == "shipping" && zus.metaData.sameAddress;
    function selectAddress(address) {
        setOpen(false);
        getAddressFormUseCase(address.id).then((response) => {
            console.log({ response, addressType });

            zus.dotUpdate(
                `metaData.${addressType}` as any,
                {
                    address1: response.address1,
                    city: response.city,
                    email: response.email || "",
                    name: response.name || "",
                    primaryPhone: response.phoneNo || "",
                    secondaryPhone: response.phoneNo2 || "",
                    state: response.state || "",
                    zipCode: response.meta?.zip_code || "",
                    id: response.id,
                } as AddressForm
            );
            zus.dotUpdate("metaData.customer", {
                id: response?.customer?.id,
                businessName: response?.customer?.businessName || "",
                isBusiness: response?.customer?.businessName != null,
            });
        });
    }
    useEffect(() => {
        searchAddressUseCase(debouncedQuery).then((res) => {
            setResult(res || []);
        });
    }, [debouncedQuery]);
    return (
        <div>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        disabled={disabled}
                        aria-expanded={open}
                        size="sm"
                        variant="outline"
                        className="h-8"
                    >
                        <Search className="h-4 w-4 text-muted-foreground" />
                    </Button>
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
                    </Command>
                    <ScrollArea className="max-h-[30vh] max-w-[300px] overflow-auto">
                        {result?.map((address, key) => (
                            <button
                                key={key}
                                onClick={() => selectAddress(address)}
                                className="teamaspace-y-1 flex w-full flex-col items-start px-4 py-2 hover:bg-accent hover:text-accent-foreground"
                            >
                                <Label className="whitespace-nowrap">
                                    {address.name}
                                </Label>
                                <div className="text-muted-foreground text-sm  flex">
                                    <span>{address.phoneAddress}</span>
                                </div>
                            </button>
                        ))}
                    </ScrollArea>
                </PopoverContent>
            </Popover>
        </div>
    );
}
