import { Button } from "@/components/ui/button";
import { useFormDataStore } from "../_hooks/form-data-store";
import { StepForm } from "./step-form";
import { generateRandomString } from "@/lib/utils";

interface Props {
    uid?: string;
}
export default function ItemSection({ uid }: Props) {
    const zus = useFormDataStore();
    return (
        <div>
            <div className="">{uid}</div>
            {zus.sequence?.stepComponent?.[uid]?.map((stepUid) => (
                <StepForm key={stepUid} stepUid={stepUid} />
            ))}
            <Button
                onClick={() => {
                    zus.newStep(uid, generateRandomString(4));
                }}
            >
                New Step
            </Button>
        </div>
    );
}
