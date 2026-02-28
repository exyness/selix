import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const alertVariants = cva(
  "relative w-full border px-6 py-4 font-mono text-xs flex items-start gap-3",
  {
    variants: {
      variant: {
        default: "bg-card border-border text-foreground",
        info: "bg-gradient-to-r from-primary/10 to-transparent border-primary/20 text-foreground",
        success: "bg-gradient-to-r from-green-900/20 to-transparent border-green-500/20 text-green-200",
        warning: "bg-gradient-to-r from-orange-900/20 to-transparent border-orange-500/20 text-orange-200",
        destructive: "bg-gradient-to-r from-red-900/20 to-transparent border-red-900/50 text-red-200",
        restricted: "bg-gradient-to-r from-red-900 to-background border-red-900/50 text-red-200",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof alertVariants>) {
  return (
    <div
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h5
      className={cn("font-mono font-bold text-[10px] tracking-[0.2em] uppercase mb-1", className)}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <div
      className={cn("text-[10px] font-mono opacity-80", className)}
      {...props}
    />
  )
}

function AlertIcon({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-shrink-0 mt-0.5", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertIcon, alertVariants }
