import { useEffect, useRef, useState } from "react";
import { useFormDataStore } from "../../_common/_stores/form-data-store";
import { zusFilterStepComponents } from "../../_utils/helpers/zus/zus-step-helper";
import { StepHelperClass } from "../../_utils/helpers/zus/zus-helper-class";

export function useStepContext(stepUid) {
    // const [selectionState, setSelectionState] = useState({
    //     uids: {},
    //     count: 0,
    // });
    // // const zus = useFormDataStore();
    // // const actionRef = useRef<HTMLDivElement>(null);
    // const [isFixed, setIsFixed] = useState(false);
    // const containerRef = useRef<HTMLDivElement>(null);
    // const allItems = zusFilterStepComponents(stepUid, zus);
    // const [items, setItems] = useState(allItems);

    // const cls = new StepHelperClass(stepUid);
    // const cls = useMemo(() => {
    //     return cl;
    // }, [
    //     stepUid,
    //     // , zus
    // ]);
    // cls.resetSelector(selectionState, setSelectionState);
    useEffect(() => {
        console.log("STEPUID CHANGE");
        // zhLoadStepComponents({
        //     stepUid,
        //     zus,
        // }).then((res) => {
        //     setItems(res);
        //     console.log("RESULT", stepUid, res?.length);
        // });
    }, [stepUid]);
    // useEffect(() => {
    //     const handleScroll = () => {
    //         if (containerRef.current) {
    //             const containerRect =
    //                 containerRef.current.getBoundingClientRect();
    //             const containerBottomVisible =
    //                 containerRect.bottom > 0 &&
    //                 containerRect.bottom <= window.innerHeight;
    //             const containerPartiallyVisible =
    //                 containerRect.top < window.innerHeight &&
    //                 containerRect.bottom > 0;

    //             const shouldBeFixed =
    //                 !containerBottomVisible && containerPartiallyVisible;
    //             if (shouldBeFixed && !isFixed) {
    //                 const containerCenter =
    //                     containerRect.left + containerRect.width / 2;
    //                 setFixedOffset(containerCenter);
    //             }
    //             if (shouldBeFixed !== isFixed) {
    //                 setIsFixed(shouldBeFixed);
    //             }
    //         }
    //     };

    //     window.addEventListener("scroll", handleScroll);
    //     handleScroll(); // Trigger on mount to set the initial state

    //     return () => window.removeEventListener("scroll", handleScroll);
    // }, [isFixed]);

    const [fixedOffset, setFixedOffset] = useState(0);
    // const searchFn = useCallback(() => {}, []);
    // const props = {
    //     stepUid,
    //     // items,
    //     // actionRef,
    //     isFixed,
    //     fixedOffset,

    //     // searchFn
    // };
    return {
        // items,
        // containerRef,
        // cls,
        // props,
        // stepUid,
        // clearSelection() {
        //     setSelectionState({
        //         uids: {},
        //         count: 0,
        //     });
        // },
        // toggleComponent(componentUid) {
        //     setSelectionState((current) => {
        //         const state = !current.uids?.[componentUid];
        //         const count = current.count + (state ? 1 : -1);
        //         const resp = {
        //             uids: {
        //                 ...current?.uids,
        //                 [componentUid]: state,
        //             },
        //             count,
        //         };
        //         return resp;
        //     });
        // },
        // actionRef,
        // isFixed,
        // fixedOffset,
        // selectionState,
    };
}
