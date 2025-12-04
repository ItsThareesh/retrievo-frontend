// app/auth/signin/page.tsx
import { Suspense } from "react";
import SignInContent from "./sign-in-content";

export default function SignInPage() {
    return (
        <Suspense fallback={<SignInFallback />}>
            <SignInContent />
        </Suspense>
    );
}

function SignInFallback() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
            <div className="p-6 border rounded-lg shadow-sm">
                <p className="text-lg font-medium">Loading...</p>
            </div>
        </div>
    );
}