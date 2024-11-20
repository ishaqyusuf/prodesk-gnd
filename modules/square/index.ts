import { env } from "@/env.mjs";
import { Client, Environment } from "square";
import { errorHandler } from "../error/handler";
import { squareSalesPaymentCreatedDta } from "@/app/(clean-code)/(sales)/_common/data-access/sales-payment-dta";

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
export interface CreateTerminalCheckoutProps {
    deviceId;
    allowTipping?: boolean;
    amount;
    idempotencyKey?;
}
export async function createTerminalCheckout({
    deviceId,
    idempotencyKey,
    amount,
    allowTipping,
}: CreateTerminalCheckoutProps) {
    return await errorHandler(async () => {
        const terminal = await client.terminalApi.createTerminalCheckout({
            idempotencyKey,
            checkout: {
                amountMoney: {
                    amount: BigInt(Number(amount) * 100),
                    currency: "USD",
                },
                deviceOptions: {
                    deviceId,
                    tipSettings: {
                        allowTipping,
                    },
                },
            },
        });
        return {
            id: terminal.result.checkout.id,
            squareOrderId: terminal.result.checkout.orderId,
            salesPayment: await squareSalesPaymentCreatedDta(
                idempotencyKey,
                terminal.result.checkout.id,
                terminal.result.checkout.orderId
            ),
        };
    });
}
