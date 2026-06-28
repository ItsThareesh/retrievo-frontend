import { signOut } from "next-auth/react";
import { toast } from "sonner";

export function useBanHandler() {
  const handleBanError = (error: unknown): boolean => {
    const err = error as any;
    const isBanned = err?.code === "USER_BANNED";

    if (isBanned) {
      toast.error("Account Suspended", {
        description: "Your account has been banned. You will be signed out.",
      });
      setTimeout(() => {
        signOut({ callbackUrl: "/auth/error?error=UserBanned" });
      }, 1500);
      return true;
    }
    return false;
  };

  return { handleBanError };
}
