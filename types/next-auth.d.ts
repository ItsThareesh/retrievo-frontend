import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string
        } & DefaultSession["user"]
        backendToken?: string
        userId?: string
    }

    interface User {
        id: string
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        sub: string
        backendToken?: string
        userId?: string
    }
}
