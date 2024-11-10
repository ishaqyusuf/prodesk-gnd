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
import { getQueryClient } from "@/providers/get-query-client";
const AppProvider = ({ children }) => {
    const queryClient = getQueryClient();
    return (
        <SessionProvider>
            <QueryClientProvider client={queryClient}>
                <Provider store={store}>
                    <ThemeProvider attribute="class" defaultTheme="light">
                        <CommandProvider>
                            <ModalProvider>
                                <NavContext.Provider value={useNavCtx()}>
                                    {/* <ReactQueryDevtools initialIsOpen={false} /> */}
                                    {children}
                                </NavContext.Provider>
                            </ModalProvider>
                        </CommandProvider>
                    </ThemeProvider>
                </Provider>
            </QueryClientProvider>
        </SessionProvider>
    );
};
export default AppProvider;
