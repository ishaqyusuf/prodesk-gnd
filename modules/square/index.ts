import { env } from "@/env.mjs";
import { Client, Environment } from "square";

let devMode = env.NODE_ENV != "production";
devMode = false;
const SQUARE_LOCATION_ID = devMode
    ? env.SQUARE_SANDBOX_LOCATION_ID
    : env.SQUARE_LOCATION_ID;
const client = new Client({
    environment: devMode ? Environment.Sandbox : Environment.Production,
    accessToken: devMode
        ? env.SQUARE_SANDBOX_ACCESS_TOKEN
        : env.SQUARE_ACCESS_TOKEN,
});

export async function getSquareDevices() {
    try {
        const devices = await client.devicesApi.listDeviceCodes();
        const _ = devices?.result?.deviceCodes
            ?.map((device) => ({
                label: device?.name,
                status: device.status as "PAIRED" | "OFFLINE",
                value: device.deviceId,
                // device,
            }))
            .sort((a, b) => a?.label?.localeCompare(b.label) as any);
        return _.filter((a, b) => _.findIndex((c) => c.value == a.value) == b);
    } catch (error) {
        console.log(error);
    }
}
export async function createTerminalSalesPayment({ deviceId }) {}
