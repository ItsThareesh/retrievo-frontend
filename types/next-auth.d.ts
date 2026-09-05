// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        backendToken?: string;
        expires_at?: number;
        user: {
            public_id: string;
            name: string;
            email: string;
            image: string | null;
            hostel: "boys" | "girls" | null;
            phone: string | null;
            instagramId: string | null;
            role: "user" | "admin";
        };
        error?: "RefreshTokenError";
    }

    interface Account {
        backendToken?: string;
        expires_at?: number;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        backendToken?: string;
        expires_at?: number; // Backend token expiry (ms) from LOGIN_TOKEN_TTL_DAYS (30 days); not refreshed
        user?: {
            public_id: string;
            name: string;
            email: string;
            image: string | null;
            hostel: "boys" | "girls" | null;
            phone: string | null;
            instagramId: string | null;
            role: "user" | "admin";
        };
        error?: "RefreshTokenError";
    }
}

// NextAuth v5 re-exports Session/User from @auth/core/types for the
// client hook (`next-auth/react`). Augment that module as well so
// `useSession()` sees `backendToken` and custom user fields.
declare module "@auth/core/types" {
    interface Session {
        backendToken?: string;
        expires_at?: number;
        user: {
            public_id: string;
            name: string;
            email: string;
            image: string | null;
            hostel: "boys" | "girls" | null;
            phone: string | null;
            instagramId: string | null;
            role: "user" | "admin";
        };
        error?: "RefreshTokenError";
    }
}