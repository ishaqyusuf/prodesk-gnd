export interface HousePackageToolMeta {
    sizes: {
        ft: string;
        in: string;
        width: boolean;
        height: boolean;
    }[];
}
export interface HousePackageTool {
    id: number;
    type: string;
    data: HousePackageToolMeta;
}
