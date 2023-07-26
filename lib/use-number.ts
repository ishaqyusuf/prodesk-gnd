export function convertToNumber(string, defult: any = null) {
  const number = parseFloat(string);

  if (isNaN(number)) {
    return defult; // or return '';
  }

  return number;
}
export function toFixed(value) {
  const number = typeof value == "string" ? parseFloat(value) : value;
  if (isNaN(value)) return value;
  return parseFloat(number.toFixed(2));
}
