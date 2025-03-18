
import { cn } from "@/lib/utils";
import { Image } from "@/components/ui/image";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showImage?: boolean;
}

export const Logo = ({ className, size = "md", showImage = true }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("font-bold flex items-center", sizeClasses[size], className)}>
      {showImage && (
        <img 
          src="/lovable-uploads/70cc2e53-7cec-4f0a-a459-b680625fb32c.png" 
          alt="Kioska Nakà Logo" 
          className={cn(
            "mr-2",
            size === "sm" ? "h-8" : size === "md" ? "h-10" : "h-14"
          )}
        />
      )}
      <span className="text-kioska-navy">Kioska Nakà</span>
    </div>
  );
};
