import { ApiError } from "square";

export async function errorHandler<T extends (...args: any) => any>(fn: T) {
    try {
        return await fn();
    } catch (error) {
        if (error instanceof ApiError) {
            // if (error instanceof ApiError) {
            //     return {
            //         errors: JSON.parse(JSON.stringify(error.errors)),
            //     };
            // }
            // console.log(error);
            // return { error: `${error?.message} ERROR!` };
        }
    }
}
