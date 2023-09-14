import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import slugify from "slugify";
import { env } from "@/env.mjs";
import dayjs from "dayjs";
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
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
  }).map(
    ([k, v]) => (!update || (update && k != "createdAt")) && (data[k] = date)
  );
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
export function sum<T>(array: T[], key: keyof T | undefined = undefined) {
  return array
    .map((v) => (!key ? v : v?.[key]))
    .map((v) => (v ? Number(v) : null))
    .filter((v) => (v as any) > 0 && !isNaN(v as any))
    .reduce((sum, val) => (sum || 0) + (val as number), 0);
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
    .filter((f) => ["lh", "rh", "unkn", "unkwn"].includes(f?.toLowercase()))
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
