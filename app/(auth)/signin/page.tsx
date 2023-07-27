import { SignInForm } from "@/components/forms/signin-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description: "",
};

export default function LoginPage() {
  return (
    <>
      <div className="container relative h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <div className="z-10  lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 bg-slate-50 shadow-xl sm:w-[350px] lg:rounded-lg lg:p-8">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">
                Welcome Back!
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter your email & password to continue
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
        <div className="srelative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
          <div
            className="absolute inset-0 bg-cover"
            style={{
              backgroundImage:
                "url(https://images.unsplash.com/photo-1589939705384-5185137a7f0f?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80)",
              // "url(https://images.unsplash.com/photo-1590069261209-f8e9b8642343?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1376&q=80)",
            }}
          />
          <div className="relative z-20 flex items-center text-lg font-medium">
            {/* <Command className="mr-2 h-6 w-6" /> GND-Prodesk */}
          </div>
        </div>
      </div>
    </>
  );
}
