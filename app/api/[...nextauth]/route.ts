import { authOptions } from "@/lib/auth-options";
import NextAuth from "next-auth";
// import { authOptions } from "@/server/auth";

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
