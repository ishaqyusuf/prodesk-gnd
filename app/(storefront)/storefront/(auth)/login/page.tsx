"use client";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, Card } from "@/components/ui/card";
import { Icons } from "@/components/_v1/icons";

export default function CustomerLoginPage() {
    return (
        <div className="  bg-gray-50 dark:bg-gray-900">
            <div className="mx-auto px-4  min-h-[70vh]  flex flex-col justify-center max-w-3xl space-y-8">
                <div className="flex items-center space-x-4">
                    <Icons.logoLg />
                    <div className="text-2xl font-bold">Welcome Back!</div>
                </div>
                <Card>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                placeholder="m@example.com"
                                required
                                type="email"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label htmlFor="password">Password</Label>
                                <Link
                                    className="ml-auto inline-block text-sm underline"
                                    href="#"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                            <Input id="password" required type="password" />
                        </div>
                        <Button className="w-full">Login</Button>
                    </CardContent>
                    <CardFooter className="text-center">
                        <div className="text-sm">
                            {"Don't"} have an account?
                            <Link className="underline ml-1" href="/register">
                                Create an Account
                            </Link>
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
