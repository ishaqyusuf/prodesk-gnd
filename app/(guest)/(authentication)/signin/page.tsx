import { SignInForm } from "@/components/forms/signin-form";
import { Shell } from "@/components/shells/shell";
import { Metadata } from "next";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import Link from "next/link";
import { isProduction } from "@/lib/is-prod";
import QuickLogin from "@/components/quick-login";
export const metadata: Metadata = {
    title: "Sign In - GND Prodesk",
    description: ""
};

export default async function LoginPage() {
    const isProd = await isProduction();
    return (
        <Shell className="sm:max-w-lg">
            <Card>
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl">Sign in</CardTitle>
                    <CardDescription>
                        Enter your email & password to continue
                    </CardDescription>
                    {!isProd && <QuickLogin />}
                </CardHeader>
                <CardContent className="grid gap-4">
                    <SignInForm />
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-muted-foreground"></div>
                    <Link
                        aria-label="Reset password"
                        href="/signin/reset-password"
                        className="text-sm text-primary underline-offset-4 transition-colors hover:underline"
                    >
                        Reset password
                    </Link>
                </CardFooter>
            </Card>
        </Shell>
    );
}
