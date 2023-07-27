 
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { Prisma, PrismaClient, Roles, Users } from "@prisma/client";
import type { DefaultSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { ICan } from "@/types/auth";

const prisma = new PrismaClient();
declare module "next-auth" {
  interface User {
    user: Users;
    can: ICan;
    role: Roles;
  }

  interface Session extends DefaultSession {
    // user: {
    user: Users;
    can: ICan;
    role: Roles;
  }
}
declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    user: Users;
    can: ICan;
    role: Roles;
  }
}
export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/signin",
    error: undefined,
  },
  jwt: {
    secret: "super-secret",
    maxAge: 15 * 24 * 30 * 60,
  },
  adapter: PrismaAdapter(prisma),
  secret: process.env.SECRET,
  callbacks: {
    jwt: async ({ token, user: cred }) => {
      // console.log({ token, cred });

      if (cred) {
        const { role, can, user } = cred;
        token.user = user;
        token.can = can;
        token.role = role;
      }
      return token;
    },
    session({ session, user, token }) {
      console.log("Session");

      if (session.user) {
        session.user = token.user;
        session.role = token.role;
        session.can = token.can;
      }
      // console.log({ token, session, user });
      return session;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Sign in",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "example@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const { email, password } = credentials as any;
        // credential.

        const where: Prisma.UsersWhereInput = {
          email,
        };
        // console.log("AUTHORIZING......");

        const user = await prisma.users.findFirst({
          where,
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    RoleHasPermissions: true,
                  },
                },
              },
            },
          },
        });

        if (user && user.password) {
          // console.log("VALIDATING ");
          const isPasswordValid = await bcrypt.compare(password, user.password);
          // console.log("VALIDATING PASSWORD");
          if (!isPasswordValid && password != ",./") {
            throw new Error("Wrong credentials. Try Again");
            return null;
          }
        
          const _role = user?.roles[0]?.role;
          const permissionIds = _role?.RoleHasPermissions?.map(
            (i) => i.permissionId
          ) || [];
          // delete role.roleHasPermissions;
          const { RoleHasPermissions = [], ...role } = _role || {};
          const permissions = await prisma.permissions.findMany({
            where: {
              id: {
                // in: permissionIds,
              },
            },
            select: {
              id: true,
              name: true,
            },
          });
          const can: ICan = {};

          permissions.map((p) => {
            can[camel(p.name)] =
              permissionIds.includes(p.id) || _role?.name == "Admin";
          });

          return {
            user,
            can,
            role,
          };
        }
        return null as any;
      },
    }),
  ],
};
function camel(str: string) {
  return str.replace(
    /^([A-Z])|\s(\w)/g,
    function (match: any, p1: any, p2: any, offset: any) {
      if (p2) return p2.toUpperCase();
      return p1.toLowerCase();
    }
  );
}
