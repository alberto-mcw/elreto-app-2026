import { cn } from "@/lib/utils";
import logoHorizontal from "@/assets/logo-horizontal.png";
import manopolaImg from "@/assets/manopla.png";

interface MasterChefLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const MasterChefLogo = ({ className, size = "md" }: MasterChefLogoProps) => {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-16",
  };

  return (
    <img 
      src={logoHorizontal}
      alt="MasterChef World App"
      className={cn(sizeClasses[size], "w-auto object-contain", className)}
    />
  );
};

export const Manopla = ({ className }: { className?: string }) => {
  return (
    <img
      src={manopolaImg}
      alt="Manopla Naranja"
      className={cn("w-full h-full object-contain", className)}
    />
  );
};
