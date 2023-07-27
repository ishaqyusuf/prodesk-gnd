"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Icons } from "@/components/icons";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signOut, useSession } from "next-auth/react";
import { _useAsync } from "@/lib/use-async";
import { useRouter } from "next/navigation";
import { ILogin, loginSchema } from "@/lib/validations/auth";

interface SignInFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SignInForm({ className, ...props }: SignInFormProps) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<any>("");
  const { register, handleSubmit } = useForm<ILogin>({
    resolver: zodResolver(loginSchema),
  });
  const { data: session } = useSession();
  const router = useRouter();
  async function onSubmit(loginData: ILogin) {
    setIsLoading(true);
    setError(null);
    const [resp, err] = await _useAsync<any>(
      signIn("credentials", {
        ...loginData,
        callbackUrl: "/loggedin",
        redirect: true,
      })
    );

    setIsLoading(false);
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-2">
          <div className="grid gap-2">
            <Label className="" htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              {...register("email")}
              placeholder="name@example.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label className="mt-2" htmlFor="password">
              Password
            </Label>
            <Input
              id="password"
              {...register("password")}
              placeholder="password"
              type="password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
            />
          </div>
          <Button className="mt-2" disabled={isLoading}>
            {isLoading && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Sign In
            <span className="sr-only">Sign in</span>
          </Button>
        </div>
      </form>
    </div>
  );
}
