import { useEffect, useState } from "react";

export function useIsPwa(): boolean {
    const [isPwa, setIsPwa] = useState(false);

    useEffect(() => {
        const standalone = window.matchMedia("(display-mode: standalone)").matches; // Modern browsers
        const iosStandalone = (window.navigator as any).standalone === true; // Legacy iOS support
        setIsPwa(standalone || iosStandalone);
    }, []);

    return isPwa;
}
