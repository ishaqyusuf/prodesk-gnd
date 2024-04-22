import { DykeDoorType } from "../type";

export interface HousePackageToolMeta {
    sizes: {
        ft: string;
        in: string;
        type?: DykeDoorType;
        width: boolean;
        height: boolean;
    }[];
}
export interface HousePackageTool {
    id: number;
    type: string;
    data: HousePackageToolMeta;
}
