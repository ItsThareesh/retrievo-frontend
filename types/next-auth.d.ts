import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            email: string;
            name: string;
            image: string;
        } & DefaultSession["user"];

        backendToken?: string;
        userId?: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        backendToken?: string;
        userId?: string;

        email?: string;
        name?: string;
        picture?: string;
        sub?: string;
    }
}