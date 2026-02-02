export const THEMES = {
    blue: {
        gradient:
            "from-blue-500 via-cyan-500 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-500",
        cardBg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
        textTitle: "text-blue-600 dark:text-blue-300",
        textMain: "text-blue-900 dark:text-blue-50",
        textSub: "text-blue-800 dark:text-blue-100",
        icon: "text-blue-600 dark:text-blue-400",
        contactBox: "bg-background dark:bg-blue-900/20",
        contactBorder: "border-blue-200 dark:border-blue-700",
        border: "border-l-blue-600",
    },
    amber: {
        gradient:
            "from-amber-500 to-orange-500 dark:from-amber-400 dark:to-orange-400",
        cardBg:
            "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
        textTitle: "text-amber-600 dark:text-amber-300",
        textMain: "text-amber-900 dark:text-amber-50",
        textSub: "text-amber-800 dark:text-amber-100",
        icon: "text-amber-600 dark:text-amber-400",
        contactBox: "bg-background dark:bg-amber-900/20",
        contactBorder: "border-amber-200 dark:border-amber-700",
        border: "border-l-amber-600",
    },
    green: {
        gradient:
            "from-emerald-500 to-teal-500 dark:from-emerald-400 dark:to-teal-400",
        cardBg:
            "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
        textTitle: "text-green-600 dark:text-green-300",
        textMain: "text-green-900 dark:text-green-50",
        textSub: "text-green-800 dark:text-green-100",
        icon: "text-green-600 dark:text-green-400",
        contactBox: "bg-background dark:bg-green-900/20",
        contactBorder: "border-green-200 dark:border-green-700",
        border: "border-l-green-600",
    },
    cyan: {
        gradient:
            "from-cyan-500 to-blue-500 dark:from-cyan-400 dark:to-blue-400",
        cardBg:
            "bg-cyan-50 dark:bg-cyan-950/30 border-cyan-200 dark:border-cyan-800",
        textTitle: "text-cyan-600 dark:text-cyan-300",
        textMain: "text-cyan-900 dark:text-cyan-50",
        textSub: "text-cyan-800 dark:text-cyan-100",
        icon: "text-cyan-600 dark:text-cyan-400",
        contactBox: "bg-background dark:bg-cyan-900/20",
        contactBorder: "border-cyan-200 dark:border-cyan-700",
        border: "border-l-cyan-600",
    },
    orange: {
        gradient: "text-red-600",
        cardBg:
            "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
        textTitle: "text-orange-600 dark:text-orange-300",
        textMain: "text-orange-900 dark:text-orange-50",
        textSub: "text-orange-800 dark:text-orange-100",
        icon: "text-orange-600 dark:text-orange-400",
        contactBox: "bg-background dark:bg-orange-900/20",
        contactBorder: "border-orange-200 dark:border-orange-700",
        border: "border-l-orange-600",
    },
};

export type ThemeKey = keyof typeof THEMES;