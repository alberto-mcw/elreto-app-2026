import { cn } from "@/lib/utils";
import logoHorizontal from "@/assets/logo-horizontal.png";
import logoVerticalCorporate from "@/assets/logo-el-reto-corporativo.png";
import manopolaImg from "@/assets/manopla.png";

interface MasterChefLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "horizontal" | "vertical";
}

export const MasterChefLogo = ({ className, size = "md", variant = "horizontal" }: MasterChefLogoProps) => {
  const horizontalSizes = {
    sm: "h-8",
    md: "h-14",
    lg: "h-16",
  };

  const verticalSizes = {
    sm: "h-20",
    md: "h-28",
    lg: "h-40",
  };

  const isVertical = variant === "vertical";
  const logo = isVertical ? logoVerticalCorporate : logoHorizontal;
  const sizeClass = isVertical ? verticalSizes[size] : horizontalSizes[size];

  return (
    <img
      src={logo}
      alt={isVertical ? "El Reto - MasterChefWorld App" : "MasterChef World App - El Reto"}
      className={cn(sizeClass, "w-auto object-contain", className)}
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
