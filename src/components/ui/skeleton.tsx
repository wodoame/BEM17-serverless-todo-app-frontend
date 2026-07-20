import * as React from "react"

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer bg-[length:900px_100%] bg-gradient-to-r from-[#EDEFF1] via-[#F6F7F8] to-[#EDEFF1] dark:from-[#152838] dark:via-[#1b3346] dark:to-[#152838]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
