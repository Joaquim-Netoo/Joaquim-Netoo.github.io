import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/* Badge do shadcn restilizado: etiqueta de terminal, 1 px, cantos retos, mono. */
const badgeVariants = cva(
  "mono inline-flex w-fit shrink-0 items-center gap-1 border px-2 py-1 text-[0.75rem] leading-none whitespace-nowrap transition-colors duration-150",
  {
    variants: {
      variant: {
        default: "border-phosphor-dim text-phosphor",
        solid: "border-phosphor bg-phosphor text-tube",
        muted: "border-phosphor-dim/50 text-paper-dim",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"
  return <Comp data-slot="badge" data-variant={variant} className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
