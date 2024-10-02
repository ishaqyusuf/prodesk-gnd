"use client";

import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { ModalProvider } from "../common/modal/provider";
import { CommandProvider } from "../cmd/provider";
import { NavContext, useNavCtx } from "./layouts/site-nav";
import { ThemeProvider } from "next-themes";
const AppProvider = ({ children }) => {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <SessionProvider>
            <Provider store={store}>
                <ThemeProvider attribute="class" defaultTheme="light">
                    <CommandProvider>
                        <ModalProvider>
                            <NavContext.Provider value={useNavCtx()}>
                                <QueryClientProvider client={queryClient}>
                                    <ReactQueryDevtools initialIsOpen={false} />
                                    {children}
                                </QueryClientProvider>
                            </NavContext.Provider>
                        </ModalProvider>
                    </CommandProvider>
                </ThemeProvider>
            </Provider>
        </SessionProvider>
    );
};
export default AppProvider;
