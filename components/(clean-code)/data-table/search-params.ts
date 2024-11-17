import {
    createParser,
    createSearchParamsCache,
    createSerializer,
    parseAsInteger,
    parseAsString,
    type inferParserType,
} from "nuqs/server";
// Note: import from 'nuqs/server' to avoid the "use client" directive
import { SORT_DELIMITER } from "@/lib/delimiters";
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

export const searchParamsParser = {
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
    customer: parseAsString,
    address: parseAsString,
    productionAssignment: parseAsString,
    status: parseAsString,
    delivery: parseAsString,
    production: parseAsString,
    invoice: parseAsString,
    rep: parseAsString,
    orderId: parseAsString,
    po: parseAsString,
    phone: parseAsString,
    pk: parseAsString,
};

export const searchParamsCache = createSearchParamsCache(searchParamsParser);

export const searchParamsSerializer = createSerializer(searchParamsParser);

export type SearchParamsType = inferParserType<typeof searchParamsParser>;
