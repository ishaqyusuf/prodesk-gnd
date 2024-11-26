import { Icons } from "@/components/_v1/icons";
import { _modal } from "@/components/common/modal/provider";
import { Button } from "@/components/ui/button";
import FormSettingsModal from "./modals/form-settings-modal";

export function FormHeader({}) {
    return (
        <div className="flex">
            <div className="flex-1" />
            <Button
                onClick={() => {
                    _modal.openSheet(<FormSettingsModal />);
                }}
                size="icon"
                variant="link"
            >
                <Icons.settings className="w-4 h-4" />
            </Button>
        </div>
    );
}
