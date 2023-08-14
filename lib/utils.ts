import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
export function labelValue(key, value, extras: any = {}) {
  return { key, value, extras };
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
export function transformData<T>(data: T, store = false) {
  let date = new Date();
  Object.entries({
    createdAt: date,
    updatedAt: date,
  }).map(([k, v]) => !(store && k == "createdAt") && (data[k] = date));
  let _data = data as any;
  let meta = _data?.meta;
  if (meta) _data.meta = removeEmptyValues(meta);
  return _data as T;
}
export function sum<T>(array: T[], key: keyof T) {
  return array.reduce(
    (sum, product) => sum + ((product?.[key] || 0) as number),
    0
  );
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
