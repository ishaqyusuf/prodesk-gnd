import { staticRolesAction } from "@/app/(v1)/_actions/hrm/static-roles";
import { deepCopy } from "@/lib/deep-copy";
import { useAppSelector } from "@/store";
import { ISlicer, dispatchSlice } from "@/store/slicers";
import { Roles } from "@prisma/client";
import { useEffect } from "react";

export default function useStaticData<T>(key: keyof ISlicer, loader) {
    const data = useAppSelector((store) => store.slicers?.[key]);

    async function load() {
        const _data = await loader();
        dispatchSlice(key, deepCopy(_data));
    }
    useEffect(() => {
        load();
    }, []);
    return {
        data: data as T, //: data as ISlicer[typeof key],
        load,
    };
}
/* eslint-disable react-hooks/rules-of-hooks */
export const staticData = {
    roles: () => useStaticData<Roles[]>("staticRoles", staticRolesAction),
};
