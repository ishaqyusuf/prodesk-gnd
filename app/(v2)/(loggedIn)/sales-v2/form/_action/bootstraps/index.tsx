import DevOnly from "@/_v2/components/common/dev-only";
import { Button } from "@/components/ui/button";
import { setStepsUids } from "./set-step-uids";
import { bootstrapHousePackageTools } from "./actions";

export default function Bootstrap() {
    return (
        <DevOnly>
            <Button
                onClick={async () => {
                    console.log(await bootstrapHousePackageTools());
                }}
            >
                Bootstrap housepackage tools
            </Button>
        </DevOnly>
    );
}
