export function getEmailUrl() {
    if (process.env.NODE_ENV === "development") {
        return "http://localhost:3000";
    }

    return "https://gnd-prodesk.vercel.app";
}

