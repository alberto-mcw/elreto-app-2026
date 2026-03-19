import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "@/components/LanguageSelector";

interface RecetarioHeaderProps {
  leftContent?: ReactNode;
  rightContent?: ReactNode;
  className?: string;
  logoSize?: "display" | "compact";
  logoHref?: string;
}

const logoSizes = {
  display: "h-44 sm:h-40 w-auto object-contain -my-12",
  compact: "h-10 w-auto object-contain",
};

export const RecetarioHeader = ({
  leftContent,
  rightContent,
  className,
  logoSize = "display",
  logoHref = "/recetario",
}: RecetarioHeaderProps) => {
  return (
    <header className={cn("px-4 sm:px-6 py-4 flex items-center justify-between max-w-5xl mx-auto", className)}>
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {leftContent}
        <Link to={logoHref} className="flex items-center shrink-0">
          <img
            src="/images/recetario-logo.png"
            alt="Mi Recetario Eterno"
            className={logoSizes[logoSize]}
          />
        </Link>
      </div>

      <div className="flex items-center gap-2 flex-wrap justify-end">
        <LanguageSelector variant="minimal" theme="recetario" />
        {rightContent}
      </div>
    </header>
  );
};
