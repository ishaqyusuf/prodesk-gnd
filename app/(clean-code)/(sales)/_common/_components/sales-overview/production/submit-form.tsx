import Button from "@/components/common/button";
import { ItemAssignment } from "../sales-items-overview";
import { useForm } from "react-hook-form";
import { useItemProdViewContext } from "./use-hooks";

interface Props {
    assignment: ItemAssignment;
}
export default function SubmitProductionForm({ assignment }: Props) {
    const ctx = useItemProdViewContext();
    const { mainCtx, item } = ctx;
    const form = useForm({
        defaultValues: {},
    });
    return <div className=""></div>;
}
