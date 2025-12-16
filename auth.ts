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

            // ID must exist for secure backend verification
            if (!account?.id_token) {
                return "/auth/error?error=MissingIdToken";
            }

            try {
                // Returns access token and user ID from backend
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id_token: account.id_token })
                });

                // Backend reachable, but rejected
                if (!res.ok) {
                    return "/auth/error?error=Default";
                }

                const data = await res.json();

                // Attach to account (will be available in jwt callback)
                account.backendToken = data.access_token;

                return true;
            }
            catch (err) {
                console.error("Backend unreachable:", err);
                return "/auth/error?error=BackendAuthFailed";
            }
        },

        async jwt({ token, account, profile }) {
            // On initial sign in, account and profile are available
            if (account && profile) {
                token.backendToken = account.backendToken;
            }

            return token;
        },

        async session({ session, token }) {
            session.backendToken = token.backendToken as string;

            try {
                if (session.backendToken) {
                    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/me`, {
                        headers: { Authorization: `Bearer ${session.backendToken}` },
                    });

                    if (res.ok) {
                        const me = await res.json();
                        session.user = {
                            ...session.user,
                            public_id: me.public_id,
                            name: me.name,
                            email: me.email,
                            image: me.image,
                            hostel: me.hostel || null,
                        };
                    }
                }
            } catch (err) {
                console.error("Failed to fetch /profile/me in session callback:", err);
            }

            return session;
        },
    },
    pages: {
        error: '/auth/error',
        signIn: '/auth/signin',
    }
});
