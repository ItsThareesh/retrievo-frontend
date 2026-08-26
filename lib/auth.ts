import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { clientFetch } from "./client-fetch";
import { APIError } from "./api-error";

async function getProfile(tokenString: string) {
    const userData = await clientFetch("/auth/me", tokenString, { timeout: 5000 });

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
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
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
                const data = await clientFetch<{ access_token: string; expires_at: number }>(
                    "/auth/google",
                    undefined,
                    {
                        method: "POST",
                        body: JSON.stringify({ id_token: account.id_token }),
                        timeout: 8000,
                    }
                );

                account.backendToken = data.access_token;
                account.expires_at = data.expires_at * 1000; // Convert to ms

                return true;
            } catch (err) {
                if (err instanceof APIError && err.status === 403) return "/auth/error?error=UserBanned";
                console.error("Backend unreachable during signIn:", err);
                return "/auth/error?error=BackendAuthFailed";
            }
        },

        async jwt({ token, account, profile, trigger, session }) {
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

            // Explicit session update (e.g. hostel/phone/instagram handle change)
            if (trigger === "update" && token.backendToken) {
                console.log("Session update triggered, refreshing user profile...");
                    
                // If the update carries a fresh backend token (e.g. from onboarding), swap it in
                if (session?.backendToken) {
                    token.backendToken = session.backendToken as string;
                    token.expires_at = (session.expires_at as number) * 1000;
                }

                try {
                    token.user = await getProfile(token.backendToken as string);
                } catch (err) {
                    console.error("Failed to refresh user profile on update:", err);
                }
                
                return token;
            }

            // Guard: nothing to validate
            if (!token.backendToken || !token.expires_at) return token;

            // No auto-refresh: the backend issues 30-day login tokens and the
            // session callback below invalidates the session once expires_at passes.

            return token;
        },

        async session({ session, token }) {
            // Token expired or missing → invalidate session
            if (!token.backendToken || (token.expires_at && Date.now() >= (token.expires_at as number))) {
                return {
                    ...session,
                    backendToken: undefined,
                    expires_at: undefined,
                    user: {
                        ...session.user,
                        public_id: "",
                        hostel: undefined,
                        phone: undefined,
                        instagramId: undefined,
                        role: undefined,
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
