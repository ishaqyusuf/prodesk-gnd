import { Prisma, SalesTaxes } from "@prisma/client";
import salesData, { TaxCodes } from "./sales-data";
import { GetSalesListQuery } from "../data-access/sales-list-dta";
import {
    anyDateQuery,
    withDeleted,
} from "@/app/(clean-code)/_common/utils/db-utils";

export function inToFt(_in) {
    let _ft = _in;
    const duo = _ft.split("x");
    if (duo.length == 2) {
        // console.log(_ft);

        return `${inToFt(duo[0]?.trim())} x ${inToFt(duo[1]?.trim())}`;
    }
    try {
        _ft = +_in.split('"')?.[0]?.split("'")[0]?.split("in")?.[0];

        if (_ft > 0) {
            _ft = +_ft;
            const ft = Math.floor(_ft / 12);
            const rem = _ft % 12;

            return `${ft}-${rem}`;
        }
    } catch (e) {}
    return _in;
}
export function ftToIn(h) {
    const [ft, _in] = h
        ?.split(" ")?.[0]
        ?.split("-")
        ?.map((s) => s?.trim())
        .filter(Boolean);
    return `${+_in + +ft * 12}in`;
}
