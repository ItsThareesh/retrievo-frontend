import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { NotificationsClient } from "./notifications-client"

export default async function NotificationsPage() {
    const session = await auth()

    if (!session?.backendToken) {
        redirect("/auth/signin?callbackUrl=/notifications")
    }

    return <NotificationsClient />
}
