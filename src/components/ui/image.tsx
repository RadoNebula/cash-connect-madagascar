
import * as React from "react"
import { cn } from "@/lib/utils"

export interface ImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: "square" | "video" | "wide" | "auto"
  className?: string
  fill?: boolean
}

const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ aspectRatio = "auto", className, fill = false, ...props }, ref) => {
    const aspectRatioClasses = {
      square: "aspect-square",
      video: "aspect-video",
      wide: "aspect-[21/9]",
      auto: "aspect-auto",
    }

    return (
      <img
        ref={ref}
        className={cn(
          fill ? "object-cover" : "",
          aspectRatioClasses[aspectRatio],
          className
        )}
        {...props}
      />
    )
  }
)

Image.displayName = "Image"

export { Image }
