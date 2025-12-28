import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        backendToken?: string;
        tokenExpires?: number;
        user: {
            public_id: string;
            email: string;
            name: string;
            image: string;
            hostel: "boys" | "girls" | null;
            phone: string | null;
        } & DefaultSession["user"];
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
        user?: {
            public_id: string;
            email: string;
            name: string;
            image: string;
            hostel: "boys" | "girls" | null;
            phone: string | null;
        };
    }
}