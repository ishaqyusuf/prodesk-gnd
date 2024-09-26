import useEffectLoader from "@/lib/use-effect-loader";
import { getExportConfigs } from "../data-access/export";
import { ExportForm, TypedExport } from "./type";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import { getExportForm, getIncludes, transformExportData } from "./config";
import * as XLSX from "xlsx";
import { useSearchParams } from "next/navigation";
import { getExportData } from "./action";
import { toast } from "sonner";

export function useExport(type) {
    const _exports = useEffectLoader(async () => await getExportConfigs(type));

    return {
        _exports: _exports?.data || [],
    };
}

export function useExportForm(type, config?: TypedExport) {
    const form = useForm<ExportForm>({
        defaultValues: getExportForm(type, config),
    });
    const list = form.watch("cellList");
    useEffect(() => {
        // form.reset();
    }, []);
    const query = useSearchParams();
    async function startExport() {
        const _q = {};
        query.forEach((v, q) => {
            _q[q] = v;
        });

        const includes = getIncludes(form.getValues());
        // console.log({ includes });
        // return;
        const data = await getExportData(type, _q, includes);

        if (!data.length) {
            toast.error("0 data found");
            return;
        }
        const dataToExport = transformExportData(form.getValues(), data);
        console.log({ dataToExport, data, includes });
        let title = "export-2024";
        let worksheetname = "";
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils?.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(workbook, worksheet, worksheetname);
        // Save the workbook as an Excel file
        XLSX.writeFile(workbook, `${title}.xlsx`);
    }
    return { form, list, startExport };
}
