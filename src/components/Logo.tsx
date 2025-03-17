
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("font-bold flex items-center", sizeClasses[size], className)}>
      <span className="text-primary mr-1">Cash</span>
      <span className="bg-primary text-primary-foreground px-2 rounded-md">Point</span>
    </div>
  );
};
