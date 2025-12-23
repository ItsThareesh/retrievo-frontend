import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            public_id: string;
            email: string;
            name: string;
            image: string;
            hostel: "boys" | "girls" | null;
        } & DefaultSession["user"];

        backendToken?: string;
        tokenExpires?: number;
    }

    interface Account {
        backendToken?: string;
        tokenExpires?: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        backendToken?: string;
        tokenExpires?: number;
    }
}