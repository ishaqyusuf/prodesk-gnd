export * as dotObject from "dot-object";
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

export function dotKeys(arr, parentKey = "", removeEmptyArrays = false) {
    return Object.keys(dotArray(arr, parentKey, removeEmptyArrays));
}
