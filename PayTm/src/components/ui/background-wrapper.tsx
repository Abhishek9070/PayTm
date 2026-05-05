import { ReactNode } from "react";

interface BackgroundWrapperProps {
  children: ReactNode;
  variant?: "soft-yellow" | "grid-purple";
}

export const BackgroundWrapper = ({
  children,
  variant = "soft-yellow",
}: BackgroundWrapperProps) => {
  const backgroundStyles = {
    "soft-yellow": {
      backgroundImage: `
        radial-gradient(circle at center, #FFF991 0%, transparent 70%)
      `,
      opacity: 0.6,
      mixBlendMode: "multiply" as const,
    },
    "grid-purple": {
      backgroundImage: `
        linear-gradient(to right, rgba(71,85,105,0.3) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(71,85,105,0.3) 1px, transparent 1px),
        radial-gradient(circle at 50% 50%, rgba(139,92,246,0.25) 0%, rgba(139,92,246,0.1) 40%, transparent 80%)
      `,
      backgroundSize: "32px 32px, 32px 32px, 100% 100%",
    },
  };

  const selectedStyle =
    variant === "soft-yellow" ? backgroundStyles["soft-yellow"] : backgroundStyles["grid-purple"];

  return (
    <div className="min-h-screen w-full relative bg-white">
      {/* Background Layer */}
      <div
        className="absolute inset-0 z-0"
        style={selectedStyle}
      />
      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundWrapper;
