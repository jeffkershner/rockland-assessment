"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScoreBadge } from "@/components/ScoreBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  Trash2,
} from "lucide-react";
import Link from "next/link";

const STATUSES = [
  "RESEARCHING",
  "QUALIFYING",
  "APPLYING",
  "SUBMITTED",
  "AWARDED",
  "DECLINED",
] as const;

interface SavedGrant {
  id: string;
  grantId: string;
  title: string;
  agency: string;
  description: string;
  deadline: string | null;
  awardFloor: number | null;
  awardCeiling: number | null;
  opportunityNumber: string | null;
  status: string;
  aiScore: number | null;
  aiSummary: string | null;
  notes: string | null;
}

interface ScoreDetail {
  score: number;
  verdict: string;
  why: string;
  keyRequirements: string[];
  redFlags: string[];
  nextStep: string;
}

export default function GrantDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [grant, setGrant] = useState<SavedGrant | null>(null);
  const [loading, setLoading] = useState(true);
  const [scoring, setScoring] = useState(false);
  const [scoreDetail, setScoreDetail] = useState<ScoreDetail | null>(null);
  const [notes, setNotes] = useState("");

  const fetchGrant = useCallback(async () => {
    // We don't have a single GET by id, so fetch all and find
    const res = await fetch("/api/grants/save");
    const data = await res.json();
    const found = (data.grants ?? []).find(
      (g: SavedGrant) => g.id === params.id
    );
    if (found) {
      setGrant(found);
      setNotes(found.notes ?? "");
    }
    setLoading(false);
  }, [params.id]);

  useEffect(() => {
    fetchGrant();
  }, [fetchGrant]);

  const updateGrant = async (data: Record<string, unknown>) => {
    const res = await fetch(`/api/grants/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const updated = await res.json();
    if (updated.grant) setGrant(updated.grant);
  };

  const handleScore = async () => {
    if (!grant) return;
    setScoring(true);
    try {
      const res = await fetch("/api/ai/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grantId: grant.grantId,
          grantTitle: grant.title,
          grantDescription: grant.description,
          grantAgency: grant.agency,
          awardCeiling: grant.awardCeiling,
        }),
      });
      const data = await res.json();
      if (data.score != null) {
        setScoreDetail(data);
        setGrant((prev) =>
          prev ? { ...prev, aiScore: data.score, aiSummary: data.why } : prev
        );
      }
    } finally {
      setScoring(false);
    }
  };

  const handleDelete = async () => {
    await fetch(`/api/grants/${params.id}`, { method: "DELETE" });
    router.push("/");
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!grant) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2">
        <p className="text-muted-foreground">Grant not found</p>
        <Link href="/" className="text-sm text-emerald-600 hover:underline">
          Back to pipeline
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Back to pipeline
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{grant.title}</h1>
        <p className="text-muted-foreground">{grant.agency}</p>
        {grant.opportunityNumber && (
          <p className="text-sm text-muted-foreground">
            {grant.opportunityNumber}
          </p>
        )}
      </div>

      {/* Meta badges */}
      <div className="flex flex-wrap gap-2">
        <ScoreBadge score={grant.aiScore} />
        {grant.deadline && (
          <Badge variant="outline">Deadline: {grant.deadline}</Badge>
        )}
        {grant.awardCeiling && (
          <Badge variant="secondary">
            Up to ${grant.awardCeiling.toLocaleString()}
          </Badge>
        )}
        {grant.awardFloor && (
          <Badge variant="secondary">
            Min ${grant.awardFloor.toLocaleString()}
          </Badge>
        )}
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-3">
        <Select
          value={grant.status}
          onValueChange={(val) => updateGrant({ status: val })}
        >
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.toLowerCase().replace("_", " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!grant.aiScore && (
          <Button
            variant="outline"
            onClick={handleScore}
            disabled={scoring}
          >
            {scoring ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Score with AI
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleDelete}>
          <Trash2 className="mr-1 h-4 w-4" /> Remove
        </Button>
      </div>

      {/* Description */}
      {grant.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {grant.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* AI Score Detail */}
      {(scoreDetail || grant.aiSummary) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">AI Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {scoreDetail ? (
              <>
                <div className="flex items-center gap-2">
                  <ScoreBadge score={scoreDetail.score} />
                  <span className="text-sm font-medium">
                    {scoreDetail.verdict}
                  </span>
                </div>
                <p className="text-sm">{scoreDetail.why}</p>
                {scoreDetail.keyRequirements?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium">Key Requirements:</p>
                    <ul className="ml-4 list-disc text-sm text-muted-foreground">
                      {scoreDetail.keyRequirements.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {scoreDetail.redFlags?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600">
                      Red Flags:
                    </p>
                    <ul className="ml-4 list-disc text-sm text-red-600">
                      {scoreDetail.redFlags.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {scoreDetail.nextStep && (
                  <div className="rounded-md bg-emerald-50 p-3">
                    <p className="text-sm font-medium">Next Step:</p>
                    <p className="text-sm">{scoreDetail.nextStep}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm">{grant.aiSummary}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => updateGrant({ notes })}
            placeholder="Add notes about this grant..."
            rows={4}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Auto-saved when you click away
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
