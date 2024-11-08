import { createContext, useContext, useEffect, useState } from "react";
import {
    GetSalesEmail,
    getSalesEmailUseCase,
} from "../../use-case/sales-email-use-case";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

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
        resolver: zodResolver(
            z.object({
                body: z.string(),
                attachment: z.string(),
            })
        ),
        defaultValues: {
            body: "",
            attachment: "",
        },
    });
    const resp = {
        ...data,
        form,
        updateEmail(email) {
            setData((d) => {
                return {
                    ...d,
                    data: {
                        ...d.data,
                        email,
                        noEmail: false,
                    },
                };
            });
        },
        async sendEmail() {
            const t = form.trigger();
            if (t) {
            }
        },
    };
    return resp;
};
const MailboxContext = createContext<ReturnType<typeof useMailboxContext>>(
    null as any
);
export const MailboxProvider = MailboxContext.Provider;

export const useMailbox = () => useContext(MailboxContext);
