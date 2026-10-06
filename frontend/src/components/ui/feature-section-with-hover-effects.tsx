import React from "react";
import { cn } from "@/lib/utils";
import {
  IconCamera,
  IconVolume,
  IconShieldCheck,
  IconBook,
  IconTimeline,
  IconLayersLinked,
  IconLanguage,
  IconDeviceMobile,
} from "@tabler/icons-react";

export interface FeatureItem {
  title: string;
  description: string;
  icon: React.ReactNode;
  tag?: string;
  isUpcoming?: boolean;
}

export function FeaturesSectionWithHoverEffects({
  features: customFeatures,
}: {
  features?: FeatureItem[];
} = {}) {
  const defaultFeatures: FeatureItem[] = [
    // ── Existing Features (Live Now) ──
    {
      title: "Real-Time Camera Translation",
      description:
        "High-frequency 21 hand landmark tracking running directly in your browser at 30 FPS with zero latency.",
      icon: <IconCamera size={26} />,
      tag: "Live Now",
      isUpcoming: false,
    },
    {
      title: "Malayalam Voice Synthesis",
      description:
        "Instant text-to-speech audio playback speaking recognized Malayalam phrases aloud for seamless hearing interaction.",
      icon: <IconVolume size={26} />,
      tag: "Live Now",
      isUpcoming: false,
    },
    {
      title: "100% On-Device Privacy",
      description:
        "Computer vision executes entirely client-side. No video streams or camera frames ever leave your local device.",
      icon: <IconShieldCheck size={26} />,
      tag: "Live Now",
      isUpcoming: false,
    },
    {
      title: "Interactive Practice Hub",
      description:
        "Rich visual dictionary, sign quiz modules, and streak tracking to help users master Indian Sign Language gestures.",
      icon: <IconBook size={26} />,
      tag: "Live Now",
      isUpcoming: false,
    },

    // ── Upcoming Features (Roadmap) ──
    {
      title: "Continuous Sentence AI",
      description:
        "Advanced sequence modeling to translate fluid multi-sign sentences and complex grammar, beyond single signs.",
      icon: <IconTimeline size={26} />,
      tag: "Upcoming",
      isUpcoming: true,
    },
    {
      title: "Two-Handed Complex Signs",
      description:
        "Dual-hand 3D tracking architecture expanding vocabulary coverage to bimanual and compound regional signs.",
      icon: <IconLayersLinked size={26} />,
      tag: "Upcoming",
      isUpcoming: true,
    },
    {
      title: "Multi-Language Speech",
      description:
        "Expanding audio synthesis to support English, Hindi, and Tamil voices alongside native Malayalam.",
      icon: <IconLanguage size={26} />,
      tag: "Upcoming",
      isUpcoming: true,
    },
    {
      title: "Offline Mobile PWA",
      description:
        "Lightweight installable mobile app with offline model weights for reliable communication without internet access.",
      icon: <IconDeviceMobile size={26} />,
      tag: "Upcoming",
      isUpcoming: true,
    },
  ];

  const features = customFeatures && customFeatures.length > 0 ? customFeatures : defaultFeatures;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 py-10 max-w-7xl mx-auto">
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  tag,
  isUpcoming,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  tag?: string;
  isUpcoming?: boolean;
  index: number;
}) => {
  return (
    <div
      className={cn(
        "flex flex-col lg:border-r border-neutral-200 py-10 relative group/feature dark:border-neutral-800 border-solid",
        (index === 0 || index === 4) && "lg:border-l dark:border-neutral-800",
        index < 4 && "lg:border-b dark:border-neutral-800"
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-100 dark:from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="flex items-center justify-between mb-4 relative z-10 px-8">
        <div className={cn(
          "transition-colors duration-200",
          isUpcoming
            ? "text-amber-600 dark:text-amber-400 group-hover/feature:text-amber-700"
            : "text-blue-600 dark:text-blue-400 group-hover/feature:text-blue-700"
        )}>
          {icon}
        </div>
        {tag && (
          <span
            className={cn(
              "text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border transition-all duration-200",
              isUpcoming
                ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800"
                : "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800"
            )}
          >
            {tag}
          </span>
        )}
      </div>
      <div className="text-base font-bold mb-2 relative z-10 px-8">
        <div
          className={cn(
            "absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full transition-all duration-200 origin-center",
            isUpcoming
              ? "bg-amber-300 dark:bg-amber-700 group-hover/feature:bg-amber-500"
              : "bg-neutral-300 dark:bg-neutral-700 group-hover/feature:bg-blue-500"
          )}
        />
        <span className="group-hover/feature:translate-x-1.5 transition duration-200 inline-block text-neutral-800 dark:text-neutral-100 leading-snug">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-600 dark:text-neutral-300 max-w-xs relative z-10 px-8 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

export default FeaturesSectionWithHoverEffects;
