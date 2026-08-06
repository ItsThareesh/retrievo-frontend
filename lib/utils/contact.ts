export const COUNTRY_CODES = [
    { value: "+91", label: "IN" },
    { value: "+971", label: "UAE" },
    { value: "+966", label: "SA" },
    { value: "+974", label: "QA" },
    { value: "+965", label: "KW" },
    { value: "+968", label: "OM" },
    { value: "+973", label: "BH" },

    { value: "+1", label: "US/CA" },
    { value: "+44", label: "UK" },
    { value: "+61", label: "AU" },
    { value: "+64", label: "NZ" },
    { value: "+353", label: "IE" },
    { value: "+49", label: "DE" },

    { value: "+65", label: "SG" },
    { value: "+60", label: "MY" },
    { value: "+66", label: "TH" },
    { value: "+84", label: "VN" },
    { value: "+81", label: "JP" },
    { value: "+82", label: "KR" },

    { value: "+33", label: "FR" },
    { value: "+31", label: "NL" },
    { value: "+41", label: "CH" },
    { value: "+39", label: "IT" },
    { value: "+46", label: "SE" },
    { value: "+47", label: "NO" },
    { value: "+45", label: "DK" },

    { value: "+27", label: "ZA" },
    { value: "+254", label: "KE" },

    { value: "+880", label: "BD" },
    { value: "+977", label: "NP" },
    { value: "+94", label: "LK" },

    { value: "+63", label: "PH" },
    { value: "+852", label: "HK" },

    { value: "+34", label: "ES" },
    { value: "+32", label: "BE" },
];

// Mirrors the backend's pydantic validators in backend/app/schemas/profile.py
const PHONE_REGEX = /^\+[1-9]\d{7,14}$/;
const INSTAGRAM_REGEX = /^(?!.*\.\.)(?!.*\.$)[a-zA-Z0-9._]{1,30}$/;

export function sanitizeInstagram(value: string): string {
    return value.replace(/\s/g, "").replace(/^@/, "");
}

export function normalizePhoneNumber(value: string): string {
    return value.replace(/[ \-\(\)]/g, "");
}

export function buildPhone(countryCode: string, localNumber: string): string {
    const digits = normalizePhoneNumber(localNumber);
    return digits ? `${countryCode}${digits}` : "";
}

export function validatePhone(countryCode: string, phone: string): string | null {
    const normalized = normalizePhoneNumber(phone);
    if (normalized && !PHONE_REGEX.test(buildPhone(countryCode, phone))) {
        return "Please enter a valid phone number.";
    }
    return null;
}

export function validateInstagram(instagramId: string): string | null {
    if (instagramId && !INSTAGRAM_REGEX.test(instagramId)) {
        return "Please enter a valid Instagram ID.";
    }
    return null;
}

export function validateContact(countryCode: string, phone: string, instagramId: string): string | null {
    if (!normalizePhoneNumber(phone) && !instagramId.trim()) {
        return "Please provide at least one contact detail.";
    }
    const phoneError = validatePhone(countryCode, phone);
    if (phoneError) return phoneError;
    const instagramError = validateInstagram(instagramId);
    if (instagramError) return instagramError;
    return null;
}
