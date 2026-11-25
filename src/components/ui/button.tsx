import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Slot } from "radix-ui"

/*
 * Button do shadcn restilizado como botão de terminal: mono, 1 px, cantos retos,
 * alvo mínimo de 48 px, press scale(0.97) sem atraso, hover só em ponteiro fino.
 */
const buttonVariants = cva(
  [
    "mono inline-flex shrink-0 items-center justify-center gap-[0.6em] border whitespace-nowrap outline-none select-none",
    "transition-[background-color,color,border-color,transform] duration-150 ease-[cubic-bezier(0.23,1,0.32,1)]",
    "active:scale-[0.97] focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-phosphor",
    "disabled:pointer-events-none disabled:opacity-50",
  ].join(" "),
  {
    variants: {
      variant: {
        default: "border-phosphor bg-phosphor text-tube hover:border-paper hover:bg-paper",
        outline: "border-phosphor bg-transparent text-phosphor hover:bg-phosphor hover:text-tube",
        ghost: "border-transparent bg-transparent text-paper-dim hover:text-phosphor",
      },
      size: {
        default: "min-h-12 px-[22px] text-[0.9375rem]",
        sm: "min-h-11 px-3 text-[0.8125rem]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
