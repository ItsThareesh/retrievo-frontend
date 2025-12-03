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
            const allowedDomain = "nitc.ac.in";
            const email = profile.email.toLowerCase();

            if (!email.endsWith(`@${allowedDomain}`)) {
                return "/auth/error?error=AccessDenied";
            }

            // Must exist for secure backend verification
            if (!account?.id_token) {
                return "/auth/error?error=MissingIdToken";
            }

            // Send ID token to backend for proper verification
            const res = await fetch(`${process.env.BACKEND_URL}/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id_token: account.id_token })
            });

            if (!res.ok) return "/auth/error?error=BackendAuthFailed";

            const data = await res.json();

            // Store backend data in account (not profile)
            profile.backendToken = data.access_token;
            profile.backendUserId = data.user_id;

            return true;
        },

        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.email = profile.email;
                token.name = profile.name;
                token.picture = profile.picture;

                token.backendToken = profile.backendToken;
                token.userId = profile.backendUserId;
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
