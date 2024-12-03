import { Label } from "@/components/ui/label";
import {
    useFormDataStore,
    ZusComponent,
} from "../_common/_stores/form-data-store";
import {
    zhLoadStepComponents,
    zusDeleteComponents,
    zusFilterStepComponents,
} from "../_utils/helpers/zus/zus-step-helper";
import { useEffectAfterMount } from "@/hooks/use-effect-after-mount";
import { Menu } from "@/components/(clean-code)/menu";
import { Icons } from "@/components/_v1/icons";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
    CheckCircle,
    ExternalLink,
    Filter,
    Info,
    Variable,
} from "lucide-react";
import { DeleteRowAction } from "@/components/_v1/data-table/data-table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { zhEditPricing } from "../_utils/helpers/zus/zus-component-helper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ComponentImg } from "./component-img";
import {
    ComponentHelperClass,
    StepHelperClass,
} from "../_utils/helpers/zus/zus-helper-class";
import { openEditComponentPrice } from "./modals/component-price-modal";
import { Badge } from "@/components/ui/badge";
import DoorSizeModal from "./modals/door-size-modal";
import { _modal } from "@/components/common/modal/provider";
import { openDoorPriceModal } from "./modals/door-price-modal";
import { openComponentVariantModal } from "./modals/component-visibility-modal";

interface Props {
    stepUid;
}
export function useStepContext(stepUid) {
    const [selectionState, setSelectionState] = useState({
        uids: {},
        count: 0,
    });
    const zus = useFormDataStore();
    const actionRef = useRef<HTMLDivElement>(null);
    const [isFixed, setIsFixed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const allItems = zusFilterStepComponents(stepUid, zus);
    const [items, setItems] = useState(allItems);

    const cls = useMemo(() => {
        const cl = new StepHelperClass(stepUid, zus);
        return cl;
    }, [stepUid, zus]);
    // cls.resetSelector(selectionState, setSelectionState);
    useEffectAfterMount(() => {
        zhLoadStepComponents({
            stepUid,
            zus,
        }).then((res) => {
            setItems(res);
            console.log("RESULT", stepUid, res?.length);
        });
    }, []);
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

                const shouldBeFixed =
                    !containerBottomVisible && containerPartiallyVisible;
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

    const [fixedOffset, setFixedOffset] = useState(0);
    const searchFn = useCallback(() => {}, []);
    const props = { stepUid, items, actionRef, isFixed, fixedOffset, searchFn };
    return {
        items,
        containerRef,
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
        actionRef,
        isFixed,
        fixedOffset,
        selectionState,
    };
}
function Step({ stepUid }: Props) {
    const ctx = useStepContext(stepUid);
    const { items, containerRef, cls, props } = ctx;

    return (
        <ScrollArea
            ref={containerRef}
            className="p-4 pb-20 h-full smax-h-[80vh] relative"
        >
            {/* <div>ITEMS: {items?.length}</div> */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {items
                    ?.filter((s) => !s._metaData?.custom)
                    ?.filter((a) => a._metaData.visible)
                    ?.map((component) => (
                        <Component
                            ctx={ctx}
                            key={component.uid}
                            component={component}
                        />
                    ))}
            </div>
            <FloatingAction ctx={ctx} />
        </ScrollArea>
    );
}
function FloatingAction({ ctx }: { ctx: ReturnType<typeof useStepContext> }) {
    const { stepUid, items, actionRef, isFixed, fixedOffset, selectionState } =
        ctx;
    const isDoor = ctx.cls.isDoor();
    const zus = useFormDataStore();

    const batchDeleteAction = useCallback(() => {
        zusDeleteComponents({
            zus,
            stepUid,
            selection: true,
        }).then((c) => {
            ctx.clearSelection();
        });
    }, [zus, stepUid, ctx]);
    const editVisibility = useCallback(() => {
        const ls = [];
        Object.entries(selectionState?.uids).map(([a, b]) => {
            if (b) ls.push(a);
        });
        openComponentVariantModal(
            new ComponentHelperClass(stepUid, zus, ls[0]),
            ls
        );
        ctx.clearSelection();
    }, [selectionState, zus, stepUid, ctx]);
    const hasSelections = useMemo(() => ctx.cls.hasSelections(), [ctx.cls]);
    return (
        <>
            <div
                ref={actionRef}
                style={isFixed ? { left: `${fixedOffset}px` } : {}}
                className={cn(
                    isFixed
                        ? "fixed bottom-4 left-1/2 transform -translate-x-1/2"
                        : "absolute bottom-4 left-1/2 transform -translate-x-1/2",
                    "bg-white"
                )}
            >
                <div className="flex border shadow gap-4 p-2 rounded-lg items-center px-4">
                    {selectionState?.count ? (
                        <>
                            <span className="uppercase font-mono font-semibold text-sm">
                                {selectionState?.count} selected
                            </span>
                            <Menu label={"Batch Action"}>
                                <Menu.Item
                                    onClick={editVisibility}
                                    icon="settings"
                                >
                                    Edit Visibility
                                </Menu.Item>
                                <DeleteRowAction
                                    menu
                                    // loadingText="Delete"
                                    action={batchDeleteAction}
                                />
                            </Menu>
                            <Button
                                onClick={() => {
                                    ctx.clearSelection();
                                }}
                                size="sm"
                                className="h-7 text-sm"
                                variant="secondary"
                            >
                                Unmark all
                            </Button>
                        </>
                    ) : (
                        <>
                            <span className="uppercase font-mono font-semibold text-sm">
                                {items?.length} components
                            </span>
                            <Menu label={"Step Option"} Icon={Icons.settings}>
                                {isDoor ? (
                                    <>
                                        <Menu.Item
                                            onClick={() => {
                                                _modal.openModal(
                                                    <DoorSizeModal
                                                        cls={ctx.cls}
                                                    />
                                                );
                                            }}
                                        >
                                            Door Size Variants
                                        </Menu.Item>
                                    </>
                                ) : (
                                    <>
                                        <Menu.Item
                                            onClick={() => {
                                                zhEditPricing(stepUid);
                                            }}
                                            icon="dollar"
                                        >
                                            Pricing
                                        </Menu.Item>
                                    </>
                                )}
                            </Menu>
                            {hasSelections && (
                                <>
                                    <Button
                                        onClick={() => {
                                            ctx.cls.nextStep();
                                        }}
                                        size="sm"
                                    >
                                        Proceed
                                    </Button>
                                </>
                            )}
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
function Component({
    component,
    ctx,
}: {
    component: ZusComponent;
    ctx: ReturnType<typeof useStepContext>;
}) {
    const { stepUid } = ctx;
    const zus = useFormDataStore();
    const stepForm = zus.kvStepForm[stepUid];
    // const _stepAction = stepForm?._stepAction;
    const selectState = ctx.selectionState;
    const [open, setOpen] = useState(false);
    const { cls } = useMemo(() => {
        const cls = new ComponentHelperClass(
            stepUid,
            zus,
            component?.uid,
            component
        );
        return {
            cls,
        };
    }, [zus, component, stepUid]);
    async function deleteStepItem() {
        await zusDeleteComponents({
            zus,
            stepUid,
            productUid: component.uid,
        });
    }

    const editVisibility = useCallback(() => {
        openComponentVariantModal(cls, [component.uid]);
    }, [cls, component]);
    const editPrice = useCallback(() => {
        openEditComponentPrice(cls);
    }, [cls]);
    const editDoorPrice = useCallback(() => {
        openDoorPriceModal(cls);
    }, [cls]);
    const selectComponent = useCallback(() => {
        if (selectState.count) {
            ctx.toggleComponent(component.uid);
            return;
        }
        cls.selectComponent();
    }, [selectState, cls, component, ctx]);
    const multiSelect = cls.isMultiSelect();

    return (
        <div
            className="relative p-2 min-h-[25vh] xl:min-h-[40vh] flex flex-col group "
            key={component.uid}
        >
            {/* {multiSelect &&
                cls.multiSelected() &&
                cls.getMultiSelectData()?.length} */}
            <button
                className={cn(
                    "border  h-full hover:bg-white  w-full rounded-lg overflow-hidden",
                    (multiSelect && cls.multiSelected()) ||
                        stepForm?.componentUid == component.uid
                        ? "border-muted-foreground bg-white"
                        : "hover:border-muted-foreground"
                )}
                onClick={selectComponent}
            >
                <div className="flex h-full flex-col">
                    <div className="flex-1">
                        <ComponentImg aspectRatio={4 / 2} src={component.img} />
                    </div>
                    <div className="p-2 border-t font-mono inline-flex text-sm justify-between">
                        <Label className=" uppercase">{component.title}</Label>
                        {component.price && (
                            <Badge className="h-5 px-1" variant="destructive">
                                ${component.price}{" "}
                            </Badge>
                        )}
                    </div>
                </div>
                {/* <div>{component.img}</div> */}
            </button>
            {/* {cls.getStepForm()?.meta?.stepPricingDeps?. } */}
            {/* <div className="absolute m-2">
                {component?.variations?.length ? (
                    <Filter className="w-4 h-4 text-muted-foreground/70" />
                ) : (
                    <></>
                    // <MinusCircle className="w-4 h-4 text-muted-foreground/70" />
                )}
            </div> */}
            {component.productCode ? (
                <div className="absolute -rotate-90 -translate-y-1/2 text-sm font-mono uppercase tracking-wider font-semibold text-muted-foreground transform top-1/2">
                    {component.productCode}
                </div>
            ) : null}
            <div
                className={cn(
                    "flex items-center absolute m-4 gap-2 top-0 left-0"
                )}
            >
                <div className={cn(selectState?.count ? "" : "hidden")}>
                    <Checkbox checked={selectState?.uids?.[component.uid]} />
                </div>
                <div className={cn(!component?.variations?.length && "hidden")}>
                    <Filter className="w-4 h-4 text-muted-foreground/70" />
                </div>
                <div className={cn(!component.redirectUid && "hidden")}>
                    <ExternalLink className="w-4 text-muted-foreground/70 h-4" />
                </div>
            </div>
            <div
                className={cn(
                    "absolute top-0 right-0",
                    open
                        ? ""
                        : selectState?.count
                        ? "hidden"
                        : "hidden group-hover:flex bg-white"
                )}
            >
                <div>
                    <Menu open={open} onOpenChanged={setOpen}>
                        <Menu.Item
                            Icon={Icons.edit}
                            SubMenu={
                                <>
                                    <Menu.Item Icon={Info}>Details</Menu.Item>
                                    <Menu.Item
                                        onClick={editVisibility}
                                        Icon={Variable}
                                    >
                                        Visibility
                                    </Menu.Item>
                                    <Menu.Item
                                        onClick={
                                            cls.isDoor()
                                                ? editDoorPrice
                                                : editPrice
                                        }
                                        Icon={Icons.dollar}
                                    >
                                        Price
                                    </Menu.Item>
                                </>
                            }
                        >
                            Edit
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                // zusToggleComponentSelect({
                                //     stepUid,
                                //     zus,
                                //     productUid: component.uid,
                                // });
                                ctx.toggleComponent(component.uid);
                            }}
                            Icon={CheckCircle}
                        >
                            Select
                        </Menu.Item>
                        <RedirectMenuItem cls={cls} />
                        <DeleteRowAction menu action={deleteStepItem} />
                    </Menu>
                </div>
            </div>
        </div>
    );
}
function RedirectMenuItem({ cls }: { cls: ComponentHelperClass }) {
    const { redirectRoutes } = useMemo(() => {
        return {
            redirectRoutes: cls.getRedirectableRoutes(),
        };
    }, [cls]);

    return (
        <Menu.Item
            Icon={ExternalLink}
            disabled={!redirectRoutes?.length}
            SubMenu={
                <>
                    {cls.redirectUid && (
                        <Menu.Item
                            onClick={() => cls.saveComponentRedirect(null)}
                        >
                            Cancel Redirect
                        </Menu.Item>
                    )}
                    {redirectRoutes?.map((r) => (
                        <Menu.Item
                            onClick={() => cls.saveComponentRedirect(r.uid)}
                            key={r.uid}
                        >
                            {r.title}
                        </Menu.Item>
                    ))}
                </>
            }
        >
            Redirect
        </Menu.Item>
    );
}
export const ComponentsStep = Step; // memo(Step);
