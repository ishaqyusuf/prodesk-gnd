import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
    parseAsBoolean,
    parseAsJson,
    parseAsString,
    parseAsStringEnum,
    useQueryStates,
} from "nuqs";
import QueryString from "qs";
import { useOnCloseQuery } from "./use-on-close-query";

export function useCustomerOverviewQuery() {
    const onClose = useOnCloseQuery();
    const [params, setParams] = useQueryStates({
        viewCustomer: parseAsBoolean,
        accountNo: parseAsString,
        tab: parseAsStringEnum(["general", "sales", "quotes", "payments"]),
        onCloseQuery: parseAsJson(),
    });
    const opened = params.viewCustomer && !!params.accountNo;

    return {
        open(accountNo, onCloseQuery?) {
            setParams({
                accountNo,
                viewCustomer: true,
                tab: "general",
                onCloseQuery: onCloseQuery || undefined,
            });
        },
        ...params,
        params,
        setParams,
        opened,
        close() {
            onClose.handle(params, setParams);
        },
    };
}
