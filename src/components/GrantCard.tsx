"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBadge } from "@/components/ScoreBadge";
import { Loader2, Plus, Sparkles } from "lucide-react";

export interface GrantCardGrant {
  id: string;
  title: string;
  agency: string;
  description?: string;
  deadline: string | null;
  awardFloor?: number | null;
  awardCeiling?: number | null;
  opportunityNumber: string;
  status?: string;
  postedDate?: string;
}

interface GrantCardProps {
  grant: GrantCardGrant;
  onSave?: (grant: GrantCardGrant) => Promise<void>;
  onScore?: (grant: GrantCardGrant) => Promise<void>;
  aiScore?: number | null;
  aiVerdict?: string | null;
  aiWhy?: string | null;
  saved?: boolean;
}

export function GrantCard({
  grant,
  onSave,
  onScore,
  aiScore,
  aiVerdict,
  aiWhy,
  saved,
}: GrantCardProps) {
  const [saving, setSaving] = useState(false);
  const [scoring, setScoring] = useState(false);

  const isDeadlineSoon =
    grant.deadline && !grant.deadline.includes("null")
      ? (() => {
          try {
            const d = new Date(grant.deadline);
            const now = new Date();
            const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
            return diff > 0 && diff < 30;
          } catch {
            return false;
          }
        })()
      : false;

  const formatAmount = (n: number | null | undefined) =>
    n ? `$${n.toLocaleString()}` : null;

  const awardRange = [
    formatAmount(grant.awardFloor),
    formatAmount(grant.awardCeiling),
  ]
    .filter(Boolean)
    .join(" – ");

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-2 text-base leading-snug">
            {grant.title}
          </CardTitle>
        </div>
        <p className="text-sm text-muted-foreground">{grant.agency}</p>
      </CardHeader>
      <CardContent className="flex-1 space-y-2 pb-2">
        {grant.opportunityNumber && (
          <p className="text-xs text-muted-foreground">
            {grant.opportunityNumber}
          </p>
        )}
        <div className="flex flex-wrap gap-1.5">
          {grant.status && (
            <Badge variant="outline" className="text-xs capitalize">
              {grant.status}
            </Badge>
          )}
          {awardRange && (
            <Badge variant="secondary" className="text-xs">
              {awardRange}
            </Badge>
          )}
          {grant.deadline && (
            <Badge
              variant={isDeadlineSoon ? "destructive" : "outline"}
              className="text-xs"
            >
              Due: {grant.deadline}
            </Badge>
          )}
        </div>
        {aiScore != null && (
          <div className="space-y-1 pt-1">
            <ScoreBadge score={aiScore} />
            {aiVerdict && (
              <p className="text-xs font-medium text-muted-foreground">
                {aiVerdict}
              </p>
            )}
            {aiWhy && (
              <p className="text-xs text-muted-foreground">{aiWhy}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2 pt-0">
        {onScore && (
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              setScoring(true);
              try {
                await onScore(grant);
              } finally {
                setScoring(false);
              }
            }}
            disabled={scoring || aiScore != null}
          >
            {scoring ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="mr-1 h-3 w-3" />
            )}
            {aiScore != null ? "Scored" : "Score with AI"}
          </Button>
        )}
        {onSave && (
          <Button
            size="sm"
            onClick={async () => {
              setSaving(true);
              try {
                await onSave(grant);
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving || saved}
          >
            {saving ? (
              <Loader2 className="mr-1 h-3 w-3 animate-spin" />
            ) : (
              <Plus className="mr-1 h-3 w-3" />
            )}
            {saved ? "In Pipeline" : "Add to Pipeline"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
