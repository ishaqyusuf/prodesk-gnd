"use client";

import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "@/store";

import { ModalProvider } from "../common/modal/provider";
import { CommandProvider } from "../cmd/provider";
import { NavContext, useNavCtx } from "./layouts/site-nav";
import { ThemeProvider } from "@/providers/theme-provider";
const AppProvider = ({ children }) => {
    return (
        <SessionProvider>
            <ModalProvider>
                <Provider store={store}>
                    <ThemeProvider attribute="class" defaultTheme="light">
                        <CommandProvider>
                            <NavContext.Provider value={useNavCtx()}>
                                {children}
                            </NavContext.Provider>
                        </CommandProvider>
                    </ThemeProvider>
                </Provider>
            </ModalProvider>
        </SessionProvider>
    );
    return (
        <SessionProvider>
            <Provider store={store}>
                <ThemeProvider attribute="class" defaultTheme="light">
                    <CommandProvider>
                        <ModalProvider>
                            <NavContext.Provider value={useNavCtx()}>
                                {children}
                            </NavContext.Provider>
                        </ModalProvider>
                    </CommandProvider>
                </ThemeProvider>
            </Provider>
        </SessionProvider>
    );
};
export default AppProvider;
