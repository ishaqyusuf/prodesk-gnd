// "use server";

import { env } from "@/env.mjs";

export const isProduction = async () => env.NODE_ENV === "production";
export const isProdClient = env.NEXT_PUBLIC_NODE_ENV === "production";
