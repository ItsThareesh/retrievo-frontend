import { redirect } from "next/navigation";
import { AdminView } from "./components/admin-view";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/user";

export default async function AdminDashboard() {
    const session = await auth();
    const role = session?.user.role;

    // Panel roles: admins get the full dashboard, security officers get the
    // same panel with the Custody Log in Resolutions' slot (AdminView renders
    // role-appropriately).
    const isPanelUser = !!session?.backendToken && (role === "admin" || role === "security_officer");
    if (!isPanelUser || !role) {
        redirect("/auth/signin?callbackUrl=/admin");
    }

    const isAdmin = role === "admin";

    return (
        <div className="container mx-auto px-4 md:px-10 py-8 min-h-[calc(100vh-4rem)]">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-3">
                    {isAdmin ? "Admin Dashboard" : "Security Office"}
                </h1>
                <p className="text-muted-foreground">
                    {isAdmin
                        ? "Platform management and moderation control center"
                        : "Custody log, user, and report monitoring - resolutions are handled by admins"}
                </p>
            </div>

            <AdminView role={role as UserRole} />
        </div>
    );
}
