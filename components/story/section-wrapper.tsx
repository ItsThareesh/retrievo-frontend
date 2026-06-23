"use client";

import { useRef, useEffect, useState } from "react";
import { type ReactNode } from "react";

interface SectionWrapperProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function SectionWrapper({ children, className, delay = 0 }: SectionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight + 60) {
      setAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setAnimated(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: "-30px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: 1,
        transform: animated ? "translateY(0)" : "translateY(20px)",
        transition: `transform 0.6s ease-out ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}
