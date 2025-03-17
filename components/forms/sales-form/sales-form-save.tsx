import {
    getSalesBookFormUseCase,
    saveFormUseCase,
} from "@/app/(clean-code)/(sales)/_common/use-case/sales-book-form-use-case";
import { useFormDataStore } from "@/app/(clean-code)/(sales)/sales-book/(form)/_common/_stores/form-data-store";
import { zhInitializeState } from "@/app/(clean-code)/(sales)/sales-book/(form)/_utils/helpers/zus/zus-form-helper";
import { Menu } from "@/components/(clean-code)/menu";
import Button from "@/components/common/button";
import { useSalesFormFeatureParams } from "@/hooks/use-sales-form-feature-params";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

interface Props {
    type: "button" | "menu";
    and?: "default" | "close" | "new";
}
export function SalesFormSave({ type = "button", and }: Props) {
    const zus = useFormDataStore();
    async function save(action: "new" | "close" | "default" = "default") {
        const searchParams = useSearchParams();
        const router = useRouter();
        const newInterfaceQuery = useSalesFormFeatureParams();
        const { kvFormItem, kvStepForm, metaData, sequence } = zus;
        const restoreMode = searchParams.get("restoreMode") != null;

        const resp = await saveFormUseCase(
            {
                kvFormItem,
                kvStepForm,
                metaData,
                sequence,
                saveAction: action,
                newFeature: newInterfaceQuery?.params?.newInterface,
            },
            zus.oldFormState,
            {
                restoreMode,
                allowRedirect: true,
            }
        );
        switch (action) {
            case "close":
                router.push(`/sales-book/${metaData.type}s`);
                break;
            case "default":
                if (resp.redirectTo) {
                    console.log(resp.redirectTo);

                    router.push(resp.redirectTo);
                }
                break;
            case "new":
                router.push(`/sales-book/create-${metaData.type}`);
        }
        // console.log({ resp });
        // return;
        if (!metaData.debugMode) {
            await refetchData();
            if (resp.data?.error) toast.error(resp.data?.error);
            else {
                toast.success("Saved", {
                    closeButton: true,
                });
            }
        } else {
            toast.info("Debug mode");
        }
        // if(resp.redirectTo)
    }
    async function refetchData() {
        if (!zus.metaData.salesId) return;
        const data = await getSalesBookFormUseCase({
            type: zus.metaData.type,
            slug: zus.metaData.salesId,
        });
        zus.init(zhInitializeState(data));
    }
    return type == "button" ? (
        <Button icon="save" size="xs" action={save} variant="default">
            <span className="">Save</span>
        </Button>
    ) : and ? (
        <Menu.Item onClick={(e) => save(and)}>Save & {and}</Menu.Item>
    ) : (
        <>
            <Menu.Item onClick={(e) => save()}>Save</Menu.Item>
            <Menu.Item
                SubMenu={
                    <>
                        <Menu.Item onClick={() => save("close")}>
                            Close
                        </Menu.Item>
                        <Menu.Item onClick={() => save("new")}>New</Menu.Item>
                    </>
                }
            >
                Save &
            </Menu.Item>
        </>
    );
}
