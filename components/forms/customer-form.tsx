"use client";

import { z } from "zod";
import { Form } from "../ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCustomerSchema } from "@/actions/schema";

type Props = {
    data?: {};
};
export function CustomerForm({ data }: Props) {
    const form = useForm<z.infer<typeof createCustomerSchema>>({
        resolver: zodResolver(createCustomerSchema),
        defaultValues: {},
    });
    return (
        <Form {...form}>
            <div className=""></div>
        </Form>
    );
}
