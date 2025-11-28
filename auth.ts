import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    // callbacks: {
    //     async jwt({ token, account, profile }) {
    //         // When user signs in, send their info to the backend to get a JWT
    //         if (account && profile) {
    //             // Store profile info in the token
    //             token.email = profile.email;
    //             token.name = profile.name;
    //             token.picture = (profile as any).picture;

    //             console.log('JWT callback - Account:', account, 'Profile:', profile);

    //             // Try to get backend token, but don't fail if backend is down
    //             try {
    //                 console.log('Attempting to fetch backend token from:', process.env.BACKEND_URL);
    //                 const response = await fetch(`${process.env.BACKEND_URL}/auth/google`, {
    //                     method: 'POST',
    //                     headers: {
    //                         'Content-Type': 'application/json',
    //                     },
    //                     body: JSON.stringify({
    //                         email: profile.email,
    //                         name: profile.name,
    //                         picture: (profile as any).picture,
    //                         google_id: profile.sub,
    //                     }),
    //                 });

    //                 if (response.ok) {
    //                     const data = await response.json();
    //                     token.backendToken = data.access_token;
    //                     token.userId = data.user_id;
    //                     console.log('Backend token received successfully');
    //                 } else {
    //                     console.warn('Backend returned non-OK status:', response.status);
    //                 }
    //             } catch (error) {
    //                 console.error('Failed to authenticate with backend:', error);
    //                 console.log('Continuing without backend token - user can still sign in');
    //             }
    //         }
    //         return token;
    //     },
    //     async session({ session, token }) {
    //         console.log('Session callback - Token:', !!token);

    //         // Pass the backend JWT token to the client session
    //         if (token.backendToken) {
    //             session.backendToken = token.backendToken as string;
    //             session.userId = token.userId as string;
    //         }

    //         // Ensure user info is always available in session
    //         if (session.user) {
    //             session.user.email = token.email as string;
    //             session.user.name = token.name as string;
    //             session.user.image = token.picture as string;
    //         }

    //         console.log('Session callback - User:', session.user?.email);
    //         return session;
    //     },
    // },
});
