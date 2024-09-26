import { ExportConfig } from "@prisma/client";

export type ExportTypes = "order" | "quote";

export type ExportMeta = {
    selectedKeys: string[];
};
export type TypedExport = Omit<ExportConfig, "meta" | "type"> & {
    meta: ExportMeta;
    type: ExportTypes;
};
export interface ExportForm {
    title: string;
    type: ExportTypes;
    exports: {
        [key in string]: {
            selected: boolean;
        };
    };
    cellList: { title: string; selectNode: string; valueNode: string }[];
}
