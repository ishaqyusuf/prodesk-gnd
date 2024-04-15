"use client";

import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ModalProvider as OldModalProvider } from "@/components/common/modal-old/provider";
import { ModalProvider } from "../common/modal/provider";
import { CommandProvider } from "../cmd/provider";
const AppProvider = ({ children }) => {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <SessionProvider>
            <Provider store={store}>
                <CommandProvider>
                    <ModalProvider>
                        <OldModalProvider>
                            <QueryClientProvider client={queryClient}>
                                <ReactQueryDevtools initialIsOpen={false} />
                                {children}
                            </QueryClientProvider>
                        </OldModalProvider>
                    </ModalProvider>
                </CommandProvider>
            </Provider>
        </SessionProvider>
    );
};
export default AppProvider;
