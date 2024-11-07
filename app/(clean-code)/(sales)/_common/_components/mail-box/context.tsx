import { createContext, useContext, useEffect, useState } from "react";
import {
    GetSalesEmail,
    getSalesEmailUseCase,
} from "../../use-case/sales-email-use-case";
import { useForm } from "react-hook-form";

// let ctx = null;

export const useMailboxContext = (id, type) => {
    useEffect(() => {
        // if (ctx?.id == id) return;
        getSalesEmailUseCase(id, type).then((data) => {
            setData(data || ({} as any));
        });
    }, []);
    const [data, setData] = useState<GetSalesEmail>({} as any);
    // if (ctx?.id == id) return ctx as typeof resp;
    const form = useForm({
        defaultValues: {
            email: "",
            attachment: "",
        },
    });
    const resp = {
        ...data,
        form,
    };
    return resp;
};
const MailboxContext = createContext<ReturnType<typeof useMailboxContext>>(
    null as any
);
export const MailboxProvider = MailboxContext.Provider;

export const useMailbox = () => useContext(MailboxContext);
