"use client";

import * as React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/_v1/icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { _useAsync } from "@/lib/use-async";
import { useRouter } from "next/navigation";
import ControlledInput from "@/components/common/controls/controlled-input";
import { toast } from "sonner";
import { createDealerPassword, VerifyToken } from "./action";
import {
    createDealerPasswordSchema,
    CreateDealerPasswordSchema,
} from "./validation";

interface SignInFormProps extends React.HTMLAttributes<HTMLDivElement> {
    val;
}

export default function ClientForm({ className, ...props }: SignInFormProps) {
    const resp: VerifyToken = React.use(props.val);
    React.useEffect(() => {
        console.log(resp);
    }, [resp]);
    const [isLoading, setIsLoading] = React.useState<boolean>(false);
    const [error, setError] = React.useState<any>("");
    const form = useForm<CreateDealerPasswordSchema>({
        resolver: zodResolver(createDealerPasswordSchema),
    });
    const { data: session } = useSession();

    const [isPending, startTransition] = React.useTransition();
    const { register, handleSubmit } = form;
    const [submitted, setSubmitted] = React.useState(false);

    const router = useRouter();
    async function onSubmit() {
        const data = form.getValues();
        console.log(data);

        startTransition(async () => {
            setError(null);
            try {
                const resp = await createDealerPassword(data);
            } catch (error) {
                if (error instanceof Error) toast.error(error.message);
            }
        });
    }
    return (
        <Form {...form}>
            <form className="grid gap-4">
                <ControlledInput
                    size="sm"
                    control={form.control}
                    name="password"
                    label="Name"
                />
                <ControlledInput
                    size="sm"
                    control={form.control}
                    name="confirmPassword"
                    label="Comfirm Password"
                />

                <Button onClick={onSubmit} disabled={isPending}>
                    {isPending && (
                        <Icons.spinner
                            className="mr-2 h-4 w-4 animate-spin"
                            aria-hidden="true"
                        />
                    )}
                    Submit
                    <span className="sr-only">Submit</span>
                </Button>
            </form>
        </Form>
    );
}
