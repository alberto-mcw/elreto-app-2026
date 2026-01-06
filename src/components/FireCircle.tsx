import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FireCircleProps {
  children?: ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  intensity?: "low" | "medium" | "high";
}

const sizeClasses = {
  sm: "w-16 h-16",
  md: "w-24 h-24",
  lg: "w-32 h-32",
  xl: "w-48 h-48",
};

const intensityClasses = {
  low: "opacity-60",
  medium: "opacity-80",
  high: "opacity-100",
};

export const FireCircle = ({ 
  children, 
  className, 
  size = "md",
  intensity = "medium" 
}: FireCircleProps) => {
  return (
    <div 
      className={cn(
        "fire-circle flex items-center justify-center",
        sizeClasses[size],
        intensityClasses[intensity],
        className
      )}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/20 to-transparent" />
      <div className="absolute inset-2 rounded-full border border-primary/50" />
      {children}
    </div>
  );
};

export const FireRing = ({ className }: { className?: string }) => {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-fire" />
      <div className="absolute inset-2 rounded-full border border-primary/20" />
      <div className="absolute -inset-2 rounded-full border border-primary/10" />
    </div>
  );
};
