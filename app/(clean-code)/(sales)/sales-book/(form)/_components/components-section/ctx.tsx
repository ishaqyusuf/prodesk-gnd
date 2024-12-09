import { useEffect, useMemo, useRef, useState } from "react";
import { useFormDataStore } from "../../_common/_stores/form-data-store";

import { StepHelperClass } from "../../_utils/helpers/zus/zus-helper-class";
import { useSticky } from "../../_hooks/use-sticky";

export function useStepContext(stepUid) {
    const [selectionState, setSelectionState] = useState({
        uids: {},
        count: 0,
    });
    const _items = useFormDataStore().kvFilteredStepComponentList?.[stepUid];
    const salesMultiplier = useFormDataStore(
        (s) => s.metaData?.salesMultiplier
    );
    const cls = useMemo(() => {
        const cls = new StepHelperClass(stepUid);

        return cls;
    }, [stepUid]);
    useEffect(() => {
        cls.refreshStepComponentsData();
    }, [cls, salesMultiplier]);
    const sticky = useSticky((bv, pv, { top, bottom }) => !bv && pv);
    const props = {
        stepUid,
        items: _items,
        sticky,

        // searchFn
    };
    return {
        items: _items || [],
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
