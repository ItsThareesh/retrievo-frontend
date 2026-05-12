import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { internalFetchWithTimeout } from "./api/helpers";

// Deduplicate concurrent token refresh requests per token
const pendingRefreshPromises = new Map<string, Promise<{ access_token: string; expires_at: number }>>();

async function getProfile(tokenString: string) {
    const res = await internalFetchWithTimeout(
        `${process.env.INTERNAL_BACKEND_URL}/profile/me`,
        { headers: { Authorization: `Bearer ${tokenString}` } },
        5000
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch user data, status: ${res.status}`);
    }

    const userData = await res.json();
    return {
        public_id: userData.public_id,
        name: userData.name,
        email: userData.email,
        image: userData.image,
        hostel: (userData.hostel ?? null) as "boys" | "girls" | null,
        phone: userData.phone ?? null,
        instagramId: userData.instagram_id ?? null,
        role: userData.role as "user" | "admin",
    };
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
                params: {
                    prompt: "select_account",
                }
            }
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 60 * 60 * 24, // 24 hours, Adjust to match your backend.
    },
    callbacks: {
        async signIn({ account, profile }) {
            if (!profile?.email) return "/auth/error?error=NoEmail";

            if (process.env.APP_ENV === "production") {
                if (!profile.email.toLowerCase().endsWith("@nitc.ac.in")) {
                    return "/auth/error?error=AccessDenied";
                }
            }

            if (!account?.id_token) {
                return "/auth/error?error=MissingIdToken";
            }

            try {
                const res = await internalFetchWithTimeout(
                    `${process.env.INTERNAL_BACKEND_URL}/auth/google`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_token: account.id_token }),
                    },
                    8000
                );

                if (res.status === 403) return "/auth/error?error=UserBanned";
                if (!res.ok) return "/auth/error?error=Default";

                const data = await res.json();
                account.backendToken = data.access_token;
                account.expires_at = data.expires_at * 1000; // to ms

                return true;
            } catch (err) {
                console.error("Backend unreachable during signIn:", err);
                return "/auth/error?error=BackendAuthFailed";
            }
        },

        async jwt({ token, account, profile, trigger }) {
            // Initial sign-in 
            // account + profile are only present on the very first call.
            // Populate the token and return early; no refresh logic needed yet.
            if (account && profile) {
                token.backendToken = account.backendToken;
                token.expires_at = account.expires_at;
                try {
                    token.user = await getProfile(account.backendToken!);
                } catch (err) {
                    console.error("Failed to fetch user profile on sign-in:", err);
                }
                return token;
            }

            // Explicit session update (e.g. hostel/phone change) 
            if (trigger === "update" && token.backendToken) {
                try {
                    token.user = await getProfile(token.backendToken as string);
                } catch (err) {
                    console.error("Failed to refresh user profile on update:", err);
                }
                return token;
            }

            // Guard: nothing to validate 
            if (!token.backendToken || !token.expires_at) return token;

            // Token expiry handling 
            const now = Date.now();
            const timeUntilExpiry = (token.expires_at as number) - now;
            const REFRESH_WINDOW = 10 * 60 * 1000; // 10 minutes

            if (timeUntilExpiry <= 0) {
                // Fully expired — force logout on next session check
                token.backendToken = undefined;
                token.expires_at = undefined;
                token.user = undefined;
                return token;
            }

            if (timeUntilExpiry <= REFRESH_WINDOW) {
                const tokenStr = token.backendToken as string;
                try {
                    // Safety valve against map growth during outages
                    if (pendingRefreshPromises.size > 100) {
                        pendingRefreshPromises.clear();
                    }

                    let refreshPromise = pendingRefreshPromises.get(tokenStr);

                    if (!refreshPromise) {
                        refreshPromise = internalFetchWithTimeout(
                            `${process.env.INTERNAL_BACKEND_URL}/auth/refresh`,
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ token: tokenStr }),
                            }
                        ).then(async (res) => {
                            if (!res.ok) throw new Error("Token refresh failed");
                            return res.json() as Promise<{ access_token: string; expires_at: number }>;
                        }).finally(() => {
                            pendingRefreshPromises.delete(tokenStr);
                        });

                        pendingRefreshPromises.set(tokenStr, refreshPromise);
                    }

                    const data = await refreshPromise;
                    token.backendToken = data.access_token;
                    token.expires_at = data.expires_at * 1000; // to ms
                } catch (err) {
                    console.error("Token refresh error:", err);
                    token.backendToken = undefined;
                    token.expires_at = undefined;
                    token.user = undefined;
                }
            }

            return token;
        },

        async session({ session, token }) {
            // backendToken being absent means the token expired or refresh failed.
            // Return a blank session so the client treats the user as logged out.
            if (!token.backendToken) {
                return {
                    ...session,
                    backendToken: undefined,
                    expires_at: undefined,
                    user: {
                        ...session.user,
                        public_id: "",
                        hostel: null,
                        phone: null,
                        instagramId: null,
                        role: "user" as const,
                    },
                };
            }

            session.backendToken = token.backendToken as string;
            session.expires_at = token.expires_at as number;

            if (token.user) {
                session.user = {
                    ...session.user,
                    ...token.user,
                };
            }

            return session;
        },
    },
    pages: {
        error: "/auth/error",
        signIn: "/auth/signin",
    },
});