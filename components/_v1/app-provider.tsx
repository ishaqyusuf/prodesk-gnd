"use client";

import { SessionProvider } from "next-auth/react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { useState } from "react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
const AppProvider = ({ children }) => {
    const [queryClient] = useState(() => new QueryClient());
    return (
        <SessionProvider>
            <Provider store={store}>
                <QueryClientProvider client={queryClient}>
                    <ReactQueryDevtools initialIsOpen={false} />
                    {children}
                </QueryClientProvider>
            </Provider>
        </SessionProvider>
    );
};
export default AppProvider;
