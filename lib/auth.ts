import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { internalFetchWithTimeout } from "./api/helpers";

// Deduplicate concurrent token refresh requests per token
const pendingRefreshPromises = new Map<string, Promise<{ access_token: string; expires_at: number }>>();

async function refreshProfile(tokenString: string) {
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
        hostel: userData.hostel || null,
        phone: userData.phone || null,
        instagramId: userData.instagram_id || null,
        role: userData.role
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
    session: { strategy: "jwt" },
    callbacks: {
        async signIn({ account, profile }) {
            if (!profile?.email) return "/auth/error?error=NoEmail";

            // Enforce domain restriction in production environment
            if (process.env.APP_ENV === "production") {
                const email = profile.email.toLowerCase();

                if (!email.endsWith('@nitc.ac.in')) {
                    return "/auth/error?error=AccessDenied";
                }
            }

            // ID must exist for secure backend verification
            if (!account?.id_token) {
                return "/auth/error?error=MissingIdToken";
            }

            try {
                // Returns access token and user ID from backend
                const res = await internalFetchWithTimeout(
                    `${process.env.INTERNAL_BACKEND_URL}/auth/google`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ id_token: account.id_token })
                    },
                    8000 // 8 second timeout for auth
                );

                // Backend reachable, but rejected
                if (res.status === 403) {
                    return "/auth/error?error=UserBanned";
                }

                if (!res.ok) {
                    return "/auth/error?error=Default";
                }

                const data = await res.json();

                // Attach to account (will be available in jwt callback)
                account.backendToken = data.access_token;
                account.expires_at = data.expires_at * 1000; // Convert to ms for JS Date

                return true;
            }
            catch (err) {
                console.error("Backend unreachable:", err);
                return "/auth/error?error=BackendAuthFailed";
            }
        },

        async jwt({ token, account, profile, trigger }) {
            // On initial sign in, account and profile are available
            if (account && profile) {
                token.backendToken = account.backendToken;
                token.expires_at = account.expires_at;

                // Fetch and cache user profile data in JWT on initial sign-in
                try {
                    token.user = await refreshProfile(token.backendToken as string);
                } catch (err) {
                    console.error("Failed to fetch user profile during initial sign-in:", err);
                }
            }

            // If update() was called, refresh user data from backend containing hostel/phone update
            if (trigger === "update" && token.backendToken) {
                try {
                    token.user = await refreshProfile(token.backendToken as string);
                } catch (err) {
                    console.error("Failed to refresh user profile:", err);
                }

                return token;
            }

            // Only check refresh if we have a token and expiry time
            if (!token.backendToken || !token.expires_at) {
                return token;
            }

            // Check if token needs refresh (refresh 10 minutes before expiry)
            const now = Date.now();
            const timeUntilExpiry = Number(token.expires_at) - now;
            const REFRESH_WINDOW = 5 * 60 * 1000; // 5 minutes

            // Already expired, then force logout
            if (timeUntilExpiry <= 0) {
                token.backendToken = null;
                token.expires_at = null;
                token.user = null;

                return token;
            }

            // If token expires in less than 5 minutes, refresh it
            if (timeUntilExpiry <= REFRESH_WINDOW) {
                try {
                    const tokenStr = token.backendToken as string;
                    let refreshPromise = pendingRefreshPromises.get(tokenStr);

                    // Start a new refresh request if one isn't already pending for this token
                    if (!refreshPromise) {
                        refreshPromise = internalFetchWithTimeout(
                            `${process.env.INTERNAL_BACKEND_URL}/auth/refresh`,
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ token: tokenStr })
                            },
                        ).then(async (res) => {
                            if (!res.ok) {
                                throw new Error("Token refresh failed");
                            }
                            return res.json();
                        }).finally(() => {
                            pendingRefreshPromises.delete(tokenStr);
                        });
                        
                        pendingRefreshPromises.set(tokenStr, refreshPromise);
                    }

                    const data = await refreshPromise;
                    token.backendToken = data.access_token;
                    token.expires_at = data.expires_at * 1000; // Convert to ms
                } catch (err) {
                    console.error("Token refresh error:", err);
                    token.backendToken = null;
                    token.expires_at = null;
                    token.user = null;

                    return token;
                }
            }

            return token;
        },

        async session({ session, token }) {
            // If the backend token was cleared (e.g., failed refresh, expired), 
            // completely invalidate the session object to prevent partial authenticated states.
            if (!token.backendToken) {
                return {
                    ...session,
                    user: undefined as any,
                    expires_at: 0,
                    backendToken: ""
                };
            }

            // Attach backend token and expiry to session
            session.backendToken = token.backendToken as string;
            session.expires_at = token.expires_at as number;

            // Use cached user data from JWT token if available
            if (token.user) {
                const userData = token.user as {
                    public_id: string;
                    name: string;
                    email: string;
                    image: string;
                    hostel: "boys" | "girls" | null;
                    phone: string | null;
                    instagramId: string | null;
                    role: "user" | "admin";
                };

                session.user = {
                    ...session.user,
                    public_id: userData.public_id,
                    name: userData.name,
                    email: userData.email,
                    image: userData.image,
                    hostel: userData.hostel,
                    phone: userData.phone,
                    instagramId: userData.instagramId,
                    role: userData.role
                };

                return session;
            }

            return session;
        },
    },
    pages: {
        error: '/auth/error',
        signIn: '/auth/signin',
    }
});
