"use client";

import { Badge } from "@/components/ui/badge";

interface ScoreBadgeProps {
  score: number | null | undefined;
  size?: "sm" | "default";
}

export function ScoreBadge({ score, size = "default" }: ScoreBadgeProps) {
  if (score == null) {
    return (
      <Badge variant="outline" className={size === "sm" ? "text-xs" : ""}>
        Not scored
      </Badge>
    );
  }

  if (score >= 70) {
    return (
      <Badge
        className={`bg-emerald-100 text-emerald-800 hover:bg-emerald-100 ${size === "sm" ? "text-xs" : ""}`}
      >
        Strong Fit ({score})
      </Badge>
    );
  }

  if (score >= 40) {
    return (
      <Badge
        className={`bg-amber-100 text-amber-800 hover:bg-amber-100 ${size === "sm" ? "text-xs" : ""}`}
      >
        Possible Fit ({score})
      </Badge>
    );
  }

  return (
    <Badge
      className={`bg-red-100 text-red-800 hover:bg-red-100 ${size === "sm" ? "text-xs" : ""}`}
    >
      Poor Fit ({score})
    </Badge>
  );
}
