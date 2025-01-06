import { _modal } from "@/components/common/modal/provider";
import FormSettingsModal from "./modals/form-settings-modal";
import { useFormDataStore } from "../_common/_stores/form-data-store";
import { Sticky } from "../_hooks/use-sticky";
import { cn } from "@/lib/utils";
import {
    getSalesBookFormUseCase,
    saveFormUseCase,
} from "../../../_common/use-case/sales-book-form-use-case";
import Button from "@/components/common/button";
import { toast } from "sonner";
import { zhInitializeState } from "../_utils/helpers/zus/zus-form-helper";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";

export function FormHeader({ sticky }: { sticky: Sticky }) {
    const zus = useFormDataStore();
    const { isFixed, containerRef } = sticky;
    const tabs = [
        { name: "info", title: "Sales Info", default: true },
        { name: "invoice", title: "Invoice Builder" },
        { name: "address", title: "Customer Info" },
        // { name: "info", title: "Customer Info" },
    ];
    const isOld = dayjs("12/18/2024").diff(
        dayjs(zus.metaData.createdAt),
        "days"
    );
    function isActive(tab) {
        return (!zus.currentTab && tab.default) || zus.currentTab == tab.name;
    }
    async function refetchData() {
        if (!zus.metaData.salesId) return;
        const data = await getSalesBookFormUseCase({
            type: zus.metaData.type,
            slug: zus.metaData.salesId,
        });

        zus.init(zhInitializeState(data));
    }
    const searchParams = useSearchParams();
    async function save() {
        const { kvFormItem, kvStepForm, metaData, sequence } = zus;
        const restoreMode = searchParams.get("restoreMode") != null;

        const resp = await saveFormUseCase(
            {
                kvFormItem,
                kvStepForm,
                metaData,
                sequence,
            },
            zus.oldFormState,
            {
                restoreMode,
                allowRedirect: true,
            }
        );
        // console.log({ resp });
        // return;
        if (!metaData.debugMode) {
            await refetchData();
            if (resp.data?.error) toast.error(resp.data?.error);
            else {
                toast.success("Saved");
            }
        } else {
            toast.info("Debug mode");
        }
        // if(resp.redirectTo)
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
                                : "",
                            tab.name == "address" && "lg:hidden"
                        )}
                        variant="ghost"
                    >
                        {tab.title}
                    </Button>
                ))}
            </div>
            <div className="flex-1" />
            <div className="flex gap-4">
                {isOld > 0 && (
                    <Link
                        className={cn(
                            buttonVariants({
                                variant: "destructive",
                            })
                        )}
                        href={`/sales-v2/form/${zus.metaData.type}/${zus.metaData.salesId}`}
                    >
                        Open In Old Version
                    </Link>
                )}
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
                    {/* <Icons.save className="size-4 mr-4" /> */}
                    <span className="">Save</span>
                </Button>
            </div>
        </div>
    );
}
