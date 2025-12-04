import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    session: { strategy: "jwt" },
    callbacks: {
        async signIn({ account, profile }) {
            if (!profile?.email) return "/auth/error?error=NoEmail";

            // Domain check
            const email = profile.email.toLowerCase();

            if (!email.endsWith('nitc.ac.in')) {
                return "/auth/error?error=AccessDenied";
            }

            // Must exist for secure backend verification
            if (!account?.id_token) {
                return "/auth/error?error=MissingIdToken";
            }

            try {
                const res = await fetch(`${process.env.BACKEND_URL}/auth/google`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_token: account.id_token })
                });

                if (!res.ok) {
                    // Backend reachable, but rejected
                    return "/auth/error?error=BackendAuthFailed";
                }

                const data = await res.json();

                // Attach to account
                account.backendToken = data.access_token;
                account.backendUserId = data.user_id;

                return true;  // allow login
            }
            catch (err) {
                console.error("Backend unreachable:", err);
                return "/auth/error?error=BackendAuthFailed";
            }
        },

        async jwt({ token, account, profile }) {
            // On initial sign in, account and profile are available
            if (account && profile) {
                token.email = profile.email;
                token.name = profile.name;
                token.picture = profile.picture;

                token.backendToken = account.backendToken;
                token.userId = account.backendUserId;
            }

            return token;
        },

        async session({ session, token }) {
            // Attach backend token and userId to session
            session.backendToken = token.backendToken as string;
            session.userId = token.userId as string;

            // Update user properties
            session.user.email = token.email!;
            session.user.name = token.name!;
            session.user.image = token.picture!;

            return session;
        },
    },
    pages: {
        error: '/auth/error',
        signIn: '/auth/signin',
    }
});
