import { Input } from "@/components/ui/input";
import {
    useFormDataStore,
    ZusGroupItemFormPath,
} from "../_common/_stores/form-data-store";
import { GroupFormClass } from "../_utils/helpers/zus/group-form-class";
import { FieldPath } from "react-hook-form";
import { Switch } from "@/components/ui/switch";

interface LineInputProps {
    lineUid;
    name: FieldPath<ZusGroupItemFormPath>;
    cls: GroupFormClass;
}
export function LineInput({ lineUid, name, cls }: LineInputProps) {
    // const state = useFormDataStore();
    const value = cls.dotGetGroupItemFormValue(lineUid, name);
    return (
        <Input
            defaultValue={value as any}
            onChange={(e) => {
                cls.dotUpdateGroupItemFormPath(lineUid, name, e.target.value);
            }}
        />
    );
}
export function LineSwitch({ lineUid, name, cls }: LineInputProps) {
    const value = cls.dotGetGroupItemFormValue(lineUid, name);

    return (
        <>
            <Switch
                defaultChecked={value as any}
                onCheckedChange={(e) => {
                    cls.dotUpdateGroupItemFormPath(lineUid, name, e);
                }}
            />
        </>
    );
}