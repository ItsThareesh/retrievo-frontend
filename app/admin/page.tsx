import { redirect } from "next/navigation";
import { AdminView } from "./components/admin-view";
import { auth } from "@/lib/auth";

export default async function AdminDashboard() {
    const session = await auth();

    const isAdmin =
        !!session?.user &&
        Date.now() < (session?.expires_at ?? 0) &&
        session.user.role === "admin";

    if (!isAdmin) {
        redirect("/auth/signin?callbackUrl=/admin");
    }

    return (
        <div className="container mx-auto py-10 px-6 max-w-7xl">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-3">
                    Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Platform management and moderation control center
                </p>
            </div>

            <AdminView />
        </div>
    );
}
