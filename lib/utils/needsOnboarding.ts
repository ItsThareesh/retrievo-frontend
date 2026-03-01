import { Session } from "next-auth";

// If NOT (has hostel AND has contact) -> onboarding required.
export function needsOnboarding(session: Session) {
    const hasHostel = !!session.user.hostel;
    const hasContact = !!session.user.phone || !!session.user.instagramId;

    return !(hasHostel && hasContact);
}