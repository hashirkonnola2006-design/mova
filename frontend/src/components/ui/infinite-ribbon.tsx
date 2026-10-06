import type * as React from "react";
import { cn } from "@/lib/utils";

export interface InfiniteRibbonProps {
  repeat?: number;
  duration?: number;
  reverse?: boolean;
  rotation?: number;
  children: React.ReactNode;
  className?: string;
}

const ribbonAnimationStyles = `
@keyframes iconiq-infinite-ribbon {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

@keyframes iconiq-infinite-ribbon-reverse {
  from {
    transform: translateX(-50%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-iconiq-infinite-ribbon {
  animation: iconiq-infinite-ribbon linear infinite;
}

.animate-iconiq-infinite-ribbon-reverse {
  animation: iconiq-infinite-ribbon-reverse linear infinite;
}
`;

export function InfiniteRibbon({
  repeat = 4,
  duration = 20,
  reverse = false,
  rotation = 0,
  children,
  className,
}: InfiniteRibbonProps) {
  return (
    <>
      <style>{ribbonAnimationStyles}</style>
      <div
        className={cn("w-full overflow-hidden", className)}
        style={{
          transform: rotation ? `rotate(${rotation}deg)` : undefined,
        }}
      >
        <div
          className={cn(
            "flex w-max items-center gap-4",
            reverse
              ? "animate-iconiq-infinite-ribbon-reverse"
              : "animate-iconiq-infinite-ribbon"
          )}
          style={{
            animationDuration: `${duration}s`,
          }}
        >
          {Array.from({ length: repeat }).map((_, index) => (
            <div key={index} className="flex shrink-0 items-center gap-4">
              {children}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
