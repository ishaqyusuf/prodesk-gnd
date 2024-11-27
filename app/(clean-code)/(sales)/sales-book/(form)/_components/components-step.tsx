import { Label } from "@/components/ui/label";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import {
    zhLoadStepComponents,
    zhSelectStepComponent,
    zusDeleteProducts,
    zusToggleComponentSelect,
} from "../_utils/helpers/zus/zus-step-helper";
import { useEffectAfterMount } from "@/hooks/use-effect-after-mount";
import { Menu } from "@/components/(clean-code)/menu";
import { Icons } from "@/components/_v1/icons";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, Info, Variable } from "lucide-react";
import { DeleteRowAction } from "@/components/_v1/data-table/data-table-row-actions";
import { Checkbox } from "@/components/ui/checkbox";
import { zhEditComponentVisibility } from "../_utils/helpers/zus/zus-component-helper";

interface Props {
    stepUid;
}
function Step({ stepUid }: Props) {
    const zus = useFormDataStore();
    const components = zus.kvFilteredStepComponentList[stepUid];
    const _stepAction = zus.kvStepForm[stepUid]?._stepAction;
    const actionRef = useRef<HTMLDivElement>(null);
    const [isFixed, setIsFixed] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
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

    useEffectAfterMount(() => {
        zhLoadStepComponents({
            stepUid,
            zus,
        }).then(() => {});
    }, []);
    const [fixedOffset, setFixedOffset] = useState(0);
    async function batchDeleteAction() {
        await zusDeleteProducts({
            zus,
            stepUid,
            selection: true,
        });
    }
    return (
        <div ref={containerRef} className="p-4 relative pb-24">
            <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {components?.map((component) => (
                    <Component
                        key={component.uid}
                        component={component}
                        stepUid={stepUid}
                    />
                ))}
            </div>
            {_stepAction?.selectionCount && (
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
                        <span className="uppercase font-mono font-semibold text-sm">
                            {_stepAction.selectionCount} selected
                        </span>
                        <Menu label={"Batch Action"}>
                            <Menu.Item></Menu.Item>{" "}
                            <DeleteRowAction
                                menu
                                // loadingText="Delete"
                                action={batchDeleteAction}
                            />
                        </Menu>
                    </div>
                </div>
            )}
        </div>
    );
}
function Component({ component, stepUid }: { component; stepUid }) {
    const zus = useFormDataStore();
    const _stepAction = zus.kvStepForm[stepUid]?._stepAction;
    const [open, setOpen] = useState(false);
    async function deleteStepItem() {
        await zusDeleteProducts({
            zus,
            stepUid,
            productUid: component.uid,
        });
    }
    function editVisibility() {
        zhEditComponentVisibility(stepUid, component.uid);
    }
    function selectComponent() {
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
        });
    }
    return (
        <div className="relative p-2 group" key={component.uid}>
            <button
                className="border w-full rounded-lg"
                onClick={selectComponent}
            >
                <Label>{component.title}</Label>
            </button>
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
