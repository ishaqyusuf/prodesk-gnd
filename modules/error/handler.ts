import { AsyncFnType } from "@/app/(clean-code)/type";
import { ApiError } from "square";

export async function errorHandler<T extends (...args: any) => any>(fn: T) {
    let rep: AsyncFnType<T> = null;
    let err = null;
    try {
        rep = await fn();
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
        // return {
        //     error: "",
        // };
        error = error.message;
    }
    return {
        resp: rep,
        error: err,
    };
}
