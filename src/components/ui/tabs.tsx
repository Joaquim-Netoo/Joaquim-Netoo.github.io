import * as React from "react"
import { cn } from "cn"
import { Tabs as TabsPrimitive } from "radix-ui"

/* Tabs do shadcn/Radix restilizadas como "drives" de terminal: [TODAS] [PYTHON] … */

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn("flex flex-col gap-6", className)}
      {...props}
    />
  )
}

function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn("flex flex-wrap items-center gap-x-1 gap-y-1", className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, children, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "mono inline-flex min-h-11 items-center px-2 text-[0.875rem] whitespace-nowrap text-paper-dim outline-none",
        "transition-[color,background-color,transform] duration-150 ease-out hover:text-phosphor",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-phosphor",
        "data-[state=active]:bg-phosphor data-[state=active]:text-tube data-[state=active]:hover:text-tube",
        "active:scale-[0.97]",
        className
      )}
      {...props}
    >
      <span aria-hidden="true">[</span>
      {children}
      <span aria-hidden="true">]</span>
    </TabsPrimitive.Trigger>
  )
}

function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content data-slot="tabs-content" className={cn("outline-none", className)} {...props} />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
