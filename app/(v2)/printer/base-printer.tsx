"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";

type PagesProps = {
    [slug in string]: {
        ready: boolean;
        data: any;
    };
};
interface Props {
    // pages: PagesProps;
    getData(slug);
    pageReady(slug, pageData);
}
export const PrintCtx = React.createContext<Props>({
    // pages: {},
} as any);
export const usePrintContext = () => React.useContext<Props>(PrintCtx);
export default function BasePrinter({ slugs, children }) {
    const defaultValues = {};
    slugs.map((s) => (defaultValues[s] = { ready: false }));
    // const [pages,setPages] = useState(defaultValues)
    const form = useForm<PagesProps>({
        defaultValues,
    });
    const pages = form.watch();
    useEffect(() => {
        console.log(pages);
    }, [pages]);
    function pageReady(slug, pageData) {
        form.setValue(`${slug}.ready`, true);
        form.setValue(`${slug}.data`, pageData);
    }
    function getData(slug) {
        return form.getValues(slug);
    }
    return createPortal(
        <PrintCtx.Provider value={{ pageReady, getData }}>
            <div className="printly">{children}</div>
        </PrintCtx.Provider>,
        document.body
    );
}
