import { Session } from "next-auth";

import { UserRole } from "@/types/user";

// Mirrors backend settings.STUDENT_EMAIL_LOCAL_PATTERN (app/core/config.py):
// student rolls concatenate directly before the domain — name_ + b/m/p +
// batch-year/roll digits + 2-letter branch code (e.g. adarsh_b240479cs).
const STUDENT_EMAIL_LOCAL_PATTERN = /_[mbp][0-9]{4,6}[a-z]{2}$/;

const BACKEND_ROLES: UserRole[] = ["student", "staff", "admin", "security_officer"];

// Ground truth is the backend's role claim (/auth/me -> session.user.role;
// assigned from the same regex at signup and re-read on session updates).
// The regex fallback only covers sessions cached before the role migration
// carried a stale/missing role.
export function isStudentUser(user: { role?: string | null; email?: string | null }): boolean {
    const role = user?.role as UserRole | undefined;
    if (role && BACKEND_ROLES.includes(role)) return role === "student";

    const local = (user?.email ?? "").split("@")[0].toLowerCase();
    return STUDENT_EMAIL_LOCAL_PATTERN.test(local);
}

// Mirrors backend is_onboarding_complete (app/services/domain/users.py):
// students need hostel + contact; everyone else (staff/officer/admin) needs
// contact only — hostel-less roles never set a hostel.
export function needsOnboarding(session: Session) {
    const hasContact = !!session.user?.phone || !!session.user?.instagramId;
    if (!isStudentUser(session.user)) return !hasContact;

    const hasHostel = !!session.user?.hostel;
    return !(hasHostel && hasContact);
}
