import { Label } from "@/components/ui/label";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import {
    zhLoadStepComponents,
    zhSelectStepComponent,
    zusDeleteComponents,
    zusFilterStepComponents,
    zusToggleComponentSelect,
} from "../_utils/helpers/zus/zus-step-helper";
import { useEffectAfterMount } from "@/hooks/use-effect-after-mount";
import { Menu } from "@/components/(clean-code)/menu";
import { Icons } from "@/components/_v1/icons";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, Info, Variable } from "lucide-react";
import { DeleteRowAction } from "@/components/_v1/data-table/data-table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import {
    zhClearSelection,
    zhEditComponentVariant,
    zhEditPricing,
} from "../_utils/helpers/zus/zus-component-helper";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ComponentImg } from "./component-img";

interface Props {
    stepUid;
}
function Step({ stepUid }: Props) {
    const zus = useFormDataStore();
    const actionRef = useRef<HTMLDivElement>(null);
    const [isFixed, setIsFixed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const allItems = zusFilterStepComponents(stepUid, zus);
    const [items, setItems] = useState(allItems);
    useEffectAfterMount(() => {
        console.log("LOADING>>>>");
        zhLoadStepComponents({
            stepUid,
            zus,
        }).then((res) => {
            setItems(res);
            console.log("RESULT", stepUid, res);
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
    return (
        <ScrollArea
            ref={containerRef}
            className="p-4 pb-20 h-full smax-h-[80vh] relative"
        >
            {/* <div>ITEMS: {items?.length}</div> */}
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {items
                    ?.filter((s) => !s._metaData?.custom)
                    ?.map((component) => (
                        <Component
                            key={component.uid}
                            component={component}
                            stepUid={stepUid}
                        />
                    ))}
            </div>
            <FloatingAction {...props} />
        </ScrollArea>
    );
}
function FloatingAction({ stepUid, items, actionRef, isFixed, fixedOffset }) {
    const zus = useFormDataStore();
    const _stepAction = zus.kvStepForm[stepUid]?._stepAction;
    async function batchDeleteAction() {
        await zusDeleteComponents({
            zus,
            stepUid,
            selection: true,
        });
    }
    async function editVisibility() {
        const ls = [];
        Object.entries(_stepAction?.selection).map(([a, b]) => {
            if (b) ls.push(a);
        });
        zhEditComponentVariant(stepUid, ls);
    }
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
                    {_stepAction?.selectionCount ? (
                        <>
                            <span className="uppercase font-mono font-semibold text-sm">
                                {_stepAction.selectionCount} selected
                            </span>
                            <Menu label={"Batch Action"}>
                                <DeleteRowAction
                                    menu
                                    // loadingText="Delete"
                                    action={batchDeleteAction}
                                />
                            </Menu>
                            <Button
                                onClick={() => {
                                    zhClearSelection(stepUid, zus);
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
                                {/* <Menu.Item
                                    onClick={editVisibility}
                                    icon="settings"
                                >
                                    Edit Visibility
                                </Menu.Item> */}
                                <Menu.Item
                                    onClick={() => {
                                        zhEditPricing(stepUid);
                                    }}
                                    icon="dollar"
                                >
                                    Pricing
                                </Menu.Item>
                            </Menu>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
function Component({ component, stepUid }: { component; stepUid }) {
    const zus = useFormDataStore();
    const stepForm = zus.kvStepForm[stepUid];
    const _stepAction = stepForm?._stepAction;
    const [open, setOpen] = useState(false);
    async function deleteStepItem() {
        await zusDeleteComponents({
            zus,
            stepUid,
            productUid: component.uid,
        });
    }
    function editVisibility() {
        zhEditComponentVariant(stepUid, [component.uid]);
    }
    const selectComponent = useCallback(() => {
        if (_stepAction.selectionCount) {
            zusToggleComponentSelect({
                stepUid,
                zus,
                productUid: component.uid,
            });
            return;
        }
        zhSelectStepComponent({
            stepUid,
            zus,
            id: component.id,
            component,
        });
    }, []);

    return (
        <div
            className="relative p-2 min-h-[25vh] xl:min-h-[40vh] flex flex-col group "
            key={component.uid}
        >
            <button
                className={cn(
                    "border  h-full hover:bg-white  w-full rounded-lg overflow-hidden",
                    stepForm?.componentUid == component.uid
                        ? "border-muted-foreground"
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
                            <span className="">${component.price} </span>
                        )}
                    </div>
                </div>
                {/* <div>{component.img}</div> */}
            </button>
            {component.productCode ? (
                <div className="absolute -rotate-90 -translate-y-1/2 text-sm font-mono uppercase tracking-wider font-semibold text-muted-foreground transform top-1/2">
                    {component.productCode}
                </div>
            ) : null}
            <div
                className={cn(
                    _stepAction?.selectionCount
                        ? "flex absolute m-4 top-0 left-0"
                        : "hidden"
                )}
            >
                <div className="">
                    <Checkbox
                        checked={_stepAction?.selection?.[component.uid]}
                    />
                </div>
            </div>
            <div
                className={cn(
                    "absolute top-0 right-0",
                    open
                        ? ""
                        : _stepAction?.selectionCount
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
                                    <Menu.Item Icon={Icons.dollar}>
                                        Price
                                    </Menu.Item>
                                </>
                            }
                        >
                            Edit
                        </Menu.Item>
                        <Menu.Item
                            onClick={() => {
                                zusToggleComponentSelect({
                                    stepUid,
                                    zus,
                                    productUid: component.uid,
                                });
                            }}
                            Icon={CheckCircle}
                        >
                            Select
                        </Menu.Item>
                        <DeleteRowAction menu action={deleteStepItem} />
                    </Menu>
                </div>
            </div>
        </div>
    );
}
export const ComponentsStep = Step; // memo(Step);
