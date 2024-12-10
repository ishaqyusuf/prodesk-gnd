import { Icons } from "@/components/_v1/icons";
import { _modal } from "@/components/common/modal/provider";
import FormSettingsModal from "./modals/form-settings-modal";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import { Sticky } from "../_hooks/use-sticky";
import { cn } from "@/lib/utils";
import { saveFormUseCase } from "../../../_common/use-case/sales-book-form-use-case";
import Button from "@/components/common/button";

export function FormHeader({ sticky }: { sticky: Sticky }) {
    const zus = useFormDataStore();
    const { isFixed, fixedOffset, containerRef } = sticky;
    const tabs = [
        { name: "invoice", title: "Invoice Builder", default: true },
        { name: "info", title: "Sales Information" },
    ];
    function isActive(tab) {
        return (!zus.currentTab && tab.default) || zus.currentTab == tab.name;
    }
    async function save() {
        const {
            kvFormItem,
            kvMultiComponent,
            kvStepComponentList,
            kvStepForm,
            metaData,
            sequence,
        } = zus;
        const resp = await saveFormUseCase(
            {
                kvFormItem,
                kvMultiComponent,
                kvStepForm,
                metaData,
                sequence,
            },
            zus.oldFormState
        );
        console.log({ resp, oldState: zus.oldFormState });
    }
    return (
        <div
            style={
                isFixed
                    ? {
                          left: `${
                              containerRef?.current?.getBoundingClientRect()
                                  ?.left
                          }px`,
                          width: `${
                              containerRef?.current?.getBoundingClientRect()
                                  ?.width
                          }px`,
                          //   right: `${
                          //       containerRef?.current?.getBoundingClientRect()
                          //           ?.right
                          //   }px`,
                      }
                    : {}
            }
            className={cn(
                "flex border-b items-center mb-4",
                isFixed &&
                    "fixed border-2s border sborder-muted-foreground/50 shadow-xl  overflow-hidden rounded-fulls  top-[55px] bg-background z-10"
            )}
        >
            <div className="">
                {tabs.map((tab) => (
                    <Button
                        key={tab.name}
                        size="default"
                        onClick={(e) => {
                            zus.dotUpdate("currentTab", tab.name as any);
                        }}
                        className={cn(
                            "border-b-2  border-transparent rounded-none text-muted-foreground",
                            isActive(tab)
                                ? "border-primary text-primary bg-muted"
                                : ""
                        )}
                        variant="ghost"
                    >
                        {tab.title}
                    </Button>
                ))}
            </div>
            <div className="flex-1" />
            <div className="flex gap-4">
                <Button
                    size="default"
                    icon="settings"
                    onClick={() => {
                        _modal.openSheet(<FormSettingsModal />);
                    }}
                    variant="outline"
                >
                    <span className="">Settings</span>
                </Button>
                <Button
                    icon="save"
                    size="default"
                    action={save}
                    variant="default"
                >
                    {/* <Icons.save className="w-4 h-4 mr-4" /> */}
                    <span className="">Save</span>
                </Button>
            </div>
        </div>
    );
}
