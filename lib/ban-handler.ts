import { toast } from "sonner";
import { signOut } from "next-auth/react";
import { APIError } from "./api-error";

/**
 * Backend rejects banned users with `403 { detail, code: "USER_BANNED" }` —
 * from both the BanCheckMiddleware (Redis fast path) and the DB backstop in
 * get_db_user. This is the single detector for that contract.
 */
export function isBanError(error: unknown): boolean {
    return error instanceof APIError && error.code === "USER_BANNED";
}

/** Toast + schedule sign-out. Returns true if `error` was a ban. */
export function handleBanError(error: unknown): boolean {
    if (!isBanError(error)) return false;

    toast.error("Account Suspended", {
        description: "Your account has been banned. You will be signed out.",
    });
    setTimeout(() => {
        signOut({ callbackUrl: "/auth/error?error=UserBanned" });
    }, 1500);
    return true;
}
