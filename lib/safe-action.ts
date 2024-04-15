import { randomUUID } from "crypto";
import { DEFAULT_SERVER_ERROR, createSafeActionClient } from "next-safe-action";
export class ActionError extends Error {}
const handleReturnedServerError = (e: Error) => {
    if (e instanceof ActionError)
        return {
            serverError: e.message,
        };
    return { serverError: DEFAULT_SERVER_ERROR };
};
export const action = createSafeActionClient({
    handleServerErrorLog: (e) => {},
    handleReturnedServerError,
    // handleReturnedServerError: (e) => {
    //     return {
    //         serverError: "",
    //     };
    // },
});
export const authAction = createSafeActionClient({
    // You can provide a middleware function. In this case, context is used
    // for (fake) auth purposes.
    middleware(parsedInput) {
        const userId = randomUUID();
        console.log(
            "HELLO FROM ACTION MIDDLEWARE, USER ID:",
            userId,
            "PARSED INPUT:",
            parsedInput
        );

        return userId;
    },
    handleReturnedServerError,
});
