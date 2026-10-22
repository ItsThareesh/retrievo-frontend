import { redirect } from "next/navigation";
import { AdminView } from "./components/admin-view";
import { auth } from "@/lib/auth";
import { UserRole } from "@/types/user";

export default async function AdminDashboard() {
    const session = await auth();
    const role = session?.user.role;

    // Panel roles: admins get the full dashboard, security officers get the
    // custody log (AdminView renders role-appropriately).
    const isPanelUser = !!session?.backendToken && (role === "admin" || role === "security_officer");
    if (!isPanelUser || !role) {
        redirect("/auth/signin?callbackUrl=/admin");
    }

    const isOfficer = role === "security_officer";

    return (
        <div className="container mx-auto py-10 px-6 max-w-7xl">
            <div className="mb-10">
                <h1 className="text-3xl font-bold tracking-tight mb-3">
                    {isOfficer ? "Security Office" : "Admin Dashboard"}
                </h1>
                <p className="text-muted-foreground">
                    {isOfficer
                        ? "Custody log, user, and report monitoring - resolutions are handled by admins"
                        : "Platform management and moderation control center"}
                </p>
            </div>

            <AdminView role={role as UserRole} />
        </div>
    );
}
