import { staticProjectsAction } from "@/app/(v1)/_actions/community/projects";
import { staticRolesAction } from "@/app/(v1)/_actions/hrm/static-roles";
import { getContractorsAction } from "@/app/(v2)/(loggedIn)/contractors/_actions/get-job-employees";
import { getJobCostList } from "@/app/(v2)/(loggedIn)/contractors/_actions/job-cost-list";
import { deepCopy } from "@/lib/deep-copy";
import { store, useAppSelector } from "@/store";
import { ISlicer, dispatchSlice } from "@/store/slicers";
import { updateStaticData } from "@/store/static-data-slice";
import { IJobType } from "@/types/hrm";
import { InstallCostLine } from "@/types/settings";
import { Projects, Roles, Users } from "@prisma/client";
import { useEffect } from "react";

export default function useStaticData<T>(key, loader) {
    const data = useAppSelector((store) => store.staticData?.[key]);
    // console.log(key);

    async function load() {
        const _data = await loader();
        store.dispatch(
            updateStaticData({
                key,
                data: _data,
            })
        );
        // dispatchSlice(key, deepCopy(_data));
    }
    useEffect(() => {
        load();
    }, []);
    return {
        data: data as T, //: data as ISlicer[typeof key],
        load,
    };
}
export const useStaticRoles = () =>
    useStaticData<Roles[]>("staticRoles", staticRolesAction);
export const useStaticContractors = () =>
    useStaticData<Users[]>("staticUsers", getContractorsAction);

export const useStaticProjects = () =>
    useStaticData<Projects[]>("staticProjects", staticProjectsAction);
export const useJobCostList = (type: IJobType) =>
    useStaticData<InstallCostLine[]>(
        "staticJobCostList",
        async () => await getJobCostList(type)
    );
