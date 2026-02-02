import { Session } from "next-auth";

// User needs onboarding if hostel is missing OR both phone and Instagram are missing.
export function needsOnboarding(session: Session) {
    return (
        !session.user.hostel ||
        (!session.user.phone && !session.user.instagramId)
    );
}