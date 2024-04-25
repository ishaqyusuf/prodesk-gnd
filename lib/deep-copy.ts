export function deepCopy<T>(data): T {
    if (!data) return data;
    return JSON.parse(JSON.stringify(data)) as T;
}
