import { useEffect, useRef, useState } from "react";

export type Sticky = ReturnType<typeof useSticky>;
export const useSticky = (
    fn: (
        bottomVisible,
        partiallyVisible,
        anchors: { top: number; bottom?: number }
    ) => boolean,
    defaultFixed = false
) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isFixed, setIsFixed] = useState(defaultFixed);
    const [fixedOffset, setFixedOffset] = useState(0);
    const actionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            if (containerRef.current) {
                const containerRect =
                    containerRef.current.getBoundingClientRect();
                const containerBottomVisible =
                    containerRect.bottom > 0 &&
                    containerRect.bottom <= window.innerHeight;
                const containerPartiallyVisible =
                    containerRect.top < window.innerHeight &&
                    containerRect.bottom > 0;
                // console.log()
                const shouldBeFixed = fn(
                    containerBottomVisible,
                    containerPartiallyVisible,
                    {
                        top: containerRect.top,
                        bottom: containerRect.bottom,
                    }
                );

                if (shouldBeFixed && !isFixed) {
                    const containerCenter =
                        containerRect.left + containerRect.width / 2;
                    setFixedOffset(containerCenter);
                }
                if (shouldBeFixed !== isFixed) {
                    setIsFixed(shouldBeFixed);
                }
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll(); // Trigger on mount to set the initial state

        return () => window.removeEventListener("scroll", handleScroll);
    }, [isFixed]);

    return {
        containerRef,
        fixedOffset,
        isFixed,
        actionRef,
    };
};
