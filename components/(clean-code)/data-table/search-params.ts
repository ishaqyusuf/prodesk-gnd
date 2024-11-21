import {
    createParser,
    createSearchParamsCache,
    createSerializer,
    parseAsBoolean,
    parseAsInteger,
    parseAsString,
    type inferParserType,
} from "nuqs/server";
// Note: import from 'nuqs/server' to avoid the "use client" directive
import { SORT_DELIMITER } from "@/lib/delimiters";
import { z } from "zod";
// import { REGIONS } from "@/constants/region";
// import { METHODS } from "@/constants/method";

// https://logs.run/i?sort=latency.desc

export const parseAsSort = createParser({
    parse(queryValue) {
        const [id, desc] = queryValue.split(SORT_DELIMITER);
        if (!id && !desc) return null;
        return { id, desc: desc === "desc" };
    },
    serialize(value) {
        return `${value.id}.${value.desc ? "desc" : "asc"}`;
    },
});
type SpecialFilters =
    | "sort"
    | "size"
    | "start"
    | "uuid"
    | "with.trashed"
    | "trashed.only"
    | "_q";
export type FilterKeys = keyof typeof searchSchema._type;
export type FilterParams = { [id in SearchParamsKeys]: any };
export type SearchParamsKeys = SpecialFilters | FilterKeys;
export const searchParamsParser: {
    [k in SearchParamsKeys]: any;
} = {
    // CUSTOM FILTERS
    // success: parseAsArrayOf(parseAsBoolean, ARRAY_DELIMITER),
    // latency: parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
    // "timing.dns": parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
    // "timing.connection": parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
    // "timing.tls": parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
    // "timing.ttfb": parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
    // "timing.transfer": parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
    // status: parseAsArrayOf(parseAsInteger, SLIDER_DELIMITER),
    // //   regions: parseAsArrayOf(parseAsStringLiteral(REGIONS), ARRAY_DELIMITER),
    // //   method: parseAsArrayOf(parseAsStringLiteral(METHODS), ARRAY_DELIMITER),
    // host: parseAsString,
    // pathname: parseAsString,
    // date: parseAsArrayOf(parseAsTimestamp, RANGE_DELIMITER),
    // // REQUIRED FOR SORTING & PAGINATION
    sort: parseAsSort,
    size: parseAsInteger.withDefault(30),
    start: parseAsInteger.withDefault(0),
    // // REQUIRED FOR SELECTION
    uuid: parseAsString,
    "customer.name": parseAsString,
    address: parseAsString,
    status: parseAsString,
    "dispatch.status": parseAsString,
    production: parseAsString,
    invoice: parseAsString,
    "sales.rep": parseAsString,
    "production.assignment": parseAsString,
    // ": parseAsString,
    "order.no": parseAsString,
    po: parseAsString,
    phone: parseAsString,
    // pk: parseAsString,
    "sales.type": parseAsString,
    "with.trashed": parseAsBoolean,
    "trashed.only": parseAsBoolean,
    "dealer.id": parseAsInteger,
    _q: parseAsString,
    id: parseAsInteger,
};
export const searchSchema = z.object({
    id: z.string().optional(),
    status: z.string().optional(),
    address: z.string().optional(),
    "customer.name": z.string().optional(),
    "order.no": z.string().optional(),
    po: z.string().optional(),
    phone: z.string().optional(),
    "dispatch.status": z.string().optional(),
    "production.assignment": z.string().optional(),
    production: z.string().optional(),
    invoice: z.string().optional(),
    "sales.rep": z.string().optional(),
    "sales.type": z.string().optional(),
    "dealer.id": z.string().optional(),
});
export const searchParamsCache = createSearchParamsCache(searchParamsParser);
export const searchParamsSerializer = createSerializer(searchParamsParser);
export type SearchParamsType = inferParserType<typeof searchParamsParser>;
