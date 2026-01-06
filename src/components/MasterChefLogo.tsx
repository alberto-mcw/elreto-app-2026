import { cn } from "@/lib/utils";

interface MasterChefLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const MasterChefLogo = ({ className, size = "md" }: MasterChefLogoProps) => {
  const sizeClasses = {
    sm: "text-4xl",
    md: "text-6xl",
    lg: "text-8xl",
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <span 
        className={cn(
          "font-black text-primary relative z-10",
          sizeClasses[size]
        )}
        style={{
          textShadow: "0 0 30px hsl(17 97% 60% / 0.6), 0 0 60px hsl(17 97% 60% / 0.3)"
        }}
      >
        M
      </span>
      <div className="absolute inset-0 blur-2xl bg-primary/20 rounded-full" />
    </div>
  );
};

export const Manopla = ({ className }: { className?: string }) => {
  return (
    <div className={cn("relative", className)}>
      <svg 
        viewBox="0 0 64 64" 
        className="w-full h-full"
        fill="none"
      >
        {/* Oven mitt / Manopla shape */}
        <defs>
          <linearGradient id="manopla-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(17, 97%, 65%)" />
            <stop offset="50%" stopColor="hsl(17, 97%, 60%)" />
            <stop offset="100%" stopColor="hsl(25, 100%, 55%)" />
          </linearGradient>
          <filter id="manopla-glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Main mitt body */}
        <path 
          d="M20 56 L20 28 Q20 20 28 20 L32 20 L32 12 Q32 8 36 8 Q40 8 40 12 L40 20 L44 20 Q52 20 52 28 L52 44 Q52 56 40 56 Z"
          fill="url(#manopla-gradient)"
          filter="url(#manopla-glow)"
          stroke="hsl(17, 97%, 70%)"
          strokeWidth="1"
        />
        
        {/* Thumb */}
        <path
          d="M20 32 L12 28 Q8 26 8 30 L8 38 Q8 42 12 42 L20 42"
          fill="url(#manopla-gradient)"
          filter="url(#manopla-glow)"
          stroke="hsl(17, 97%, 70%)"
          strokeWidth="1"
        />
        
        {/* Stitching details */}
        <path
          d="M24 48 L48 48"
          stroke="hsl(17, 97%, 75%)"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          opacity="0.6"
        />
        <path
          d="M36 16 L36 24"
          stroke="hsl(17, 97%, 75%)"
          strokeWidth="1"
          opacity="0.4"
        />
      </svg>
    </div>
  );
};
