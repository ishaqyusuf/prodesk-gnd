import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";
import { env } from "@/env.mjs";
import dayjs from "dayjs";
import { toast } from "sonner";
import Error from "next/error";
import { convertToNumber } from "./use-number";
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
export function randomNumber2(min, max) {
    var number = Math.floor(Math.random() * (max - min + 1)) + min;

    return "" + number; //.substring(add);
}
export function randomNumber(digit = 1) {
    var add = 1,
        max = 12 - add; // 12 is the min safe number Math.random() can generate without it starting to pad the end with zeros.

    if (digit > max) {
        return randomNumber(max) + randomNumber(digit - max);
    }
    max = Math.pow(10, digit + add);
    var min = max / 10; // Math.pow(10, n) basically
    var number = Math.floor(Math.random() * (max - min + 1)) + min;

    return ("" + number).substring(add);
}
export function capitalizeFirstLetter(string) {
    if (!string) return string;
    return string.charAt(0).toUpperCase() + string.slice(1);
}
export function labelValue(label, value, extras: any = {}) {
    return { label, value, ...extras };
}
export function textValue(text, value?, extras: any = {}) {
    return { text, value: value || text, ...extras };
}
export function keyValue(key, value) {
    return { key, value };
}
export function removeEmptyValues(obj) {
    if (!obj) return obj;
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            if (obj[key] && typeof obj[key] === "object") {
                // Recurse into nested objects
                removeEmptyValues(obj[key]);
                if (Object.keys(obj[key]).length === 0) {
                    delete obj[key]; // Delete the key if the nested object is empty after removal
                }
            } else if (
                obj[key] === null ||
                obj[key] === undefined ||
                obj[key] === ""
            ) {
                delete obj[key]; // Delete keys with empty, null, or undefined values
            }
        }
    }
    return obj;
}
export function transformData<T>(data: T, update = false) {
    let date = new Date();
    Object.entries({
        createdAt: date,
        updatedAt: date,
    }).map(([k, v]) => {
        if (!update || (update && k != "createdAt")) {
            if (k == "createdAt" && data[k]) return;
            data[k] = date;
        }
    });
    let _data = data as any;
    let meta = _data?.meta;
    Object.entries(_data).map(([k, v]) => {
        if (v instanceof Date) {
            _data[k] = v.toISOString();
        }
    });
    if (meta) _data.meta = removeEmptyValues(meta);
    return _data as T;
}
export async function slugModel(value, model, c = 0) {
    let slug = slugify([value, c > 0 ? c : null].filter(Boolean).join(" "));

    let count = await model.count({
        where: {
            slug,
        },
    });
    if (count > 0) return await slugModel(value, model, c + 1);

    return slug;
}
export function sum<T>(array?: T[], key: keyof T | undefined = undefined) {
    if (!array) return 0;
    return array
        .map((v) => (!key ? v : v?.[key]))
        .map((v) => (v ? Number(v) : null))
        .filter((v) => (v as any) > 0 && !isNaN(v as any))
        .reduce((sum, val) => (sum || 0) + (val as number), 0);
}
export function sumKeyValues(arg) {
    let total = 0;
    if (arg && typeof arg === "object")
        Object.entries(arg).map(([k, v]) => {
            if (k) total += Number(v) || 0;
        });
    return total;
}
export const formatCurrency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD", // Replace with your desired currency code
});
export function toSingular(plural) {
    const rules = [
        { suffix: "s", replace: "" },
        { suffix: "es", replace: "" },
        { suffix: "ies", replace: "y" },
        // Add more rules as needed
    ];

    for (const rule of rules) {
        if (plural.endsWith(rule.suffix)) {
            return plural.slice(0, -rule.suffix.length) + rule.replace;
        }
    }

    return plural; // Return unchanged if no matching rule found
}
export function dotArray(obj, parentKey = "", removeEmptyArrays = false) {
    let result = {};
    if (!obj) obj = {};
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            const newKey = parentKey ? `${parentKey}.${key}` : key;

            if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
                const nested = dotArray(obj[key], newKey);
                result = { ...result, ...nested };
            } else {
                if (
                    !(
                        Array.isArray(obj[key]) &&
                        obj[key]?.length == 0 &&
                        removeEmptyArrays
                    )
                )
                    result[newKey] = obj[key];
            }
        }
    }

    return result;
}
const camelCaseKey = (key) =>
    key.replace(/_([a-zA-Z0-9])/g, (_, c) => c.toUpperCase());
export function camel(str?: string) {
    if (!str) return str;
    return str.replace(
        /^([A-Z])|\s(\w)/g,
        function (match: any, p1: any, p2: any, offset: any) {
            if (p2) return p2.toUpperCase();
            return p1.toLowerCase();
        }
    );
}
export function designDotToObject(object) {
    // return toDotNotation(object);
    let tr = {};
    Object.entries(object).map(([k, v]) => {
        const [k1, k2] = k.split(".").map(camelCaseKey) as any;
        if (k1 && k2) {
            if (!tr[k1]) tr[k1] = {};
            tr[k1][k2] = v;
        }
    });
    return tr;
}
export function addSpacesToCamelCase(input) {
    return input.replace(/([a-z])([A-Z])/g, "$1 $2");
}
export function toDotNotation(obj, res = {}, current = "") {
    for (const key in obj) {
        let value = obj[key];
        let newKey = current ? current + "." + key : key; // joined key with dot
        if (value && typeof value === "object") {
            toDotNotation(value, res, newKey); // it's a nested object, so do it again
        } else {
            res[newKey] = value; // it's not an object, so set the property
        }
    }
    return res;
}
export function generateRandomString(length) {
    const charset =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomString = "";

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        randomString += charset.charAt(randomIndex);
    }

    return randomString;
}
export function truthy<T>(condition, _true: T[] = [], _false: T[] = []): any {
    if (condition) return _true;
    return _false;
}
export function addPercentage(value, percentage) {
    return value + (value || 0) * ((percentage || 100) / 100);
}
export function getModelNumber(modelName) {
    return modelName
        ?.split(" ")
        .filter(
            (f) => !["lh", "rh", "unkn", "unkwn"].includes(f?.toLowerCase())
        )
        .join(" ");
}
export const uniqueBy = (data, key) => {
    const unique = [...new Set(data.map((item) => item[key]?.toLowerCase()))];
    // console.log(unique);
    return unique.map((s) => {
        const d = data.find((h) => h[key]?.toLowerCase() == s);
        return {
            ...d,
        };
    });
};
// data.reduce((result, item) => {
//   const lowercaseCategory = item[key].trim().toLowerCase();
//   if (!result.some((x) => x?.[key] === lowercaseCategory)) {
//     result.push({ ...item, [key]: lowercaseCategory });
//   }
//   console.log(result);
//   return result;
// }, []);
export async function _serverAction(
    // fn,
    // onSuccess: any = undefined,
    // onError = undefined
    {
        fn,
        onSuccess,
        onError,
    }: {
        fn;
        onSuccess?(data?);
        onError?(error);
    }
) {
    try {
        const data = await fn();
        onSuccess && (await onSuccess(data));
    } catch (e) {
        let err: any = e;
        if (err.message) toast.error(err.message);
        console.log(err);
        console.log(err.message);
        onError && onError(e);
    }
}
export function groupArray<T>(arr: T[], by: keyof T): { [k in string]: T[] } {
    const grouped: any = {};

    for (const item of arr) {
        const title = item[by];

        if (!grouped[title]) {
            grouped[title] = [];
        }
        grouped[title].push(item);
    }
    return grouped;
}
export function chunkArray(array, chunkSize) {
    const result: any[] = [];
    const arr = [...array];
    while (arr.length > 0) result.push(arr.splice(0, chunkSize));
    return result;
    // for (let i =0; i <array.length; i += chunkSize)
    //     result.push(array.slice(i, i + chunkSize))
    // return result;
}
export const filteredOptions = (q, items, labelKey = "label") => {
    console.log(items.length);
    console.log(q);
    const escapedText = !q
        ? ""
        : q?.toString().replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

    const pattern = new RegExp(escapedText, "i");
    let filteredOptions = items?.filter((option) =>
        pattern.test(option[labelKey])
    );
    // filteredOptions = uniqueBy(filteredOptions, "name").filter(
    //     (a, i) => i < 25
    // );
    return uniqueBy(filteredOptions, labelKey)?.filter((_, i) => i < 25); //.filter((a, i) => i < 25);
};
