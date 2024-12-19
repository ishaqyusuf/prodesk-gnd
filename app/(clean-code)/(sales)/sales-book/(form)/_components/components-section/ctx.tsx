import { useEffect, useMemo, useRef, useState } from "react";
import {
    useFormDataStore,
    ZusComponent,
} from "../../_common/_stores/form-data-store";

import { StepHelperClass } from "../../_utils/helpers/zus/zus-helper-class";
import { useSticky } from "../../_hooks/use-sticky";
import { useDebounce } from "@/hooks/use-debounce";

export type UseStepContext = ReturnType<typeof useStepContext>;
export function useStepContext(stepUid) {
    const [selectionState, setSelectionState] = useState({
        uids: {},
        count: 0,
    });
    const [stepComponents, setStepComponents] = useState<ZusComponent[]>([]);
    const [tabComponents, setTabComponents] = useState<ZusComponent[]>([]);
    const [filteredComponents, setFilteredComponents] = useState<
        ZusComponent[]
    >([]);
    function selectAll() {
        setSelectionState((pre) => {
            const uids = {};
            filteredComponents.map((s) => (uids[s.uid] = true));
            console.log(uids);

            return {
                uids,
                count: filteredComponents.length,
            };
        });
    }
    // const _items = useFormDataStore().kvFilteredStepComponentList?.[stepUid];
    const [q, setQ] = useState("");
    const db = useDebounce(q, 800);
    const [tab, setTab] = useState<"main" | "custom" | "hidden">("main");
    useEffect(() => {
        setTabComponents(
            stepComponents.filter((s) => {
                const md = s._metaData;
                return tab == "custom"
                    ? md.custom
                    : tab == "hidden"
                    ? !md.visible
                    : md.visible;
            })
        );
    }, [tab, stepComponents]);
    useEffect(() => {
        const _filtered = stepComponents.filter((s) => {
            const filters = [];
            if (q)
                filters.push(
                    s.title?.toLowerCase()?.includes(q?.toLowerCase())
                );
            switch (tab) {
                case "hidden":
                    filters.push(!s._metaData.visible);
                    break;
                case "main":
                    filters.push(s._metaData.visible);
                    filters.push(!s._metaData.custom);
                    break;
                case "custom":
                    filters.push(s._metaData.custom);
                    break;
            }
            return filters.every((s) => s);
        });
        setFilteredComponents(_filtered);
        console.log(_filtered);
        console.log(stepComponents.length);
    }, [stepComponents, db, tab]);
    const salesMultiplier = useFormDataStore(
        (s) => s.metaData?.salesMultiplier
    );
    const cls = useMemo(() => {
        const cls = new StepHelperClass(stepUid);

        return cls;
    }, [stepUid]);
    useEffect(() => {
        cls.fetchStepComponents().then((result) => {
            setStepComponents(result);
        });
    }, [salesMultiplier]);
    // useEffect(() => {
    //     cls.refreshStepComponentsData();
    // }, [cls, salesMultiplier]);
    const sticky = useSticky((bv, pv, { top, bottom }) => !bv && pv);
    const props = {
        stepUid,
        items: filteredComponents,
        sticky,
        // searchFn
    };

    return {
        tabComponents,
        selectAll,
        q,
        setQ,
        items: filteredComponents || [],
        sticky,
        cls,
        props,
        stepUid,
        clearSelection() {
            setSelectionState({
                uids: {},
                count: 0,
            });
        },
        toggleComponent(componentUid) {
            setSelectionState((current) => {
                const state = !current.uids?.[componentUid];
                const count = current.count + (state ? 1 : -1);
                const resp = {
                    uids: {
                        ...current?.uids,
                        [componentUid]: state,
                    },
                    count,
                };

                return resp;
            });
        },

        selectionState,
    };
}
