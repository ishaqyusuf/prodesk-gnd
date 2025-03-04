import {
    parseAsBoolean,
    parseAsString,
    parseAsStringEnum,
    useQueryStates,
} from "nuqs";

export function useCustomerOverviewQuery() {
    const [params, setParams] = useQueryStates({
        viewCustomer: parseAsBoolean,
        accountNo: parseAsString,
        tab: parseAsStringEnum(["general", "sales", "quotes", "payments"]),
    });
    const opened = params.viewCustomer && !!params.accountNo;

    return {
        ...params,
        setParams,
        opened,
        close() {
            setParams(null);
        },
    };
}
