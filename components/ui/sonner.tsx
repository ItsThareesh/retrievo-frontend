"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      closeButton
      icons={{
        success: <CircleCheckIcon className="size-5 text-emerald-500" />,
        info: <InfoIcon className="size-5 text-primary" />,
        warning: <TriangleAlertIcon className="size-5 text-amber-500" />,
        error: <OctagonXIcon className="size-5 text-red-500" />,
        loading: <Loader2Icon className="size-5 animate-spin text-primary" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group rounded-xl border border-border bg-popover text-popover-foreground shadow-lg ring-1 ring-black/5 dark:ring-white/10 backdrop-blur-sm",
          title: "text-sm font-semibold tracking-tight",
          description: "text-sm text-muted-foreground",
          actionButton:
            "bg-primary text-primary-foreground font-medium hover:bg-primary/90 rounded-lg",
          cancelButton:
            "bg-muted text-muted-foreground font-medium hover:bg-muted/80 rounded-lg",
          closeButton:
            "opacity-50 hover:opacity-100 transition-opacity text-muted-foreground",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          "--width": "380px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
