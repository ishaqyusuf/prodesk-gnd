import { IJobs } from "@/types/hrm";
import { useFormContext } from "react-hook-form";

interface ISubmitJob {
    ctx: {
        id: any;
    };
}
export default function useSubmitJob() {
    const form = useFormContext<IJobs & ISubmitJob>();
    const ctx = form.watch("ctx");

    return {
        form,
    };
}
