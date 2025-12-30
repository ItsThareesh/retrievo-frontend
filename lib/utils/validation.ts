const FIELD_LIMITS = {
    title: { min: 3, max: 30 },
    location: { min: 3, max: 30 },
    description: { min: 20, max: 280 },
};

export function validateForm(data: Record<string, string>): { valid: boolean; message?: string } {
    for (const [key, limits] of Object.entries(FIELD_LIMITS)) {
        const value = data[key]?.trim();
        const capitalizedKey = key.slice(0, 1).toUpperCase() + key.slice(1);

        if (!value) {
            return { valid: false, message: `${capitalizedKey} cannot be empty.` };
        }

        if (value.length < limits.min) {
            return {
                valid: false,
                message: `${capitalizedKey} must be at least ${limits.min} characters.`,
            };
        }

        if (value.length > limits.max) {
            return {
                valid: false,
                message: `${capitalizedKey} must be less than ${limits.max} characters.`,
            };
        }
    }

    return { valid: true };
}