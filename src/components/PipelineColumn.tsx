"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/ScoreBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

const STATUSES = [
  "RESEARCHING",
  "QUALIFYING",
  "APPLYING",
  "SUBMITTED",
  "AWARDED",
  "DECLINED",
] as const;

const STATUS_COLORS: Record<string, string> = {
  RESEARCHING: "bg-blue-50 border-blue-200",
  QUALIFYING: "bg-purple-50 border-purple-200",
  APPLYING: "bg-amber-50 border-amber-200",
  SUBMITTED: "bg-cyan-50 border-cyan-200",
  AWARDED: "bg-emerald-50 border-emerald-200",
  DECLINED: "bg-gray-50 border-gray-200",
};

interface PipelineGrant {
  id: string;
  grantId: string;
  title: string;
  agency: string;
  deadline: string | null;
  awardCeiling: number | null;
  aiScore: number | null;
  status: string;
}

interface PipelineColumnProps {
  status: string;
  grants: PipelineGrant[];
  onStatusChange: (id: string, newStatus: string) => void;
}

export function PipelineColumn({
  status,
  grants,
  onStatusChange,
}: PipelineColumnProps) {
  return (
    <div
      className={`flex min-w-[280px] flex-col rounded-lg border p-3 ${STATUS_COLORS[status] ?? "bg-gray-50"}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold capitalize">
          {status.toLowerCase().replace("_", " ")}
        </h3>
        <Badge variant="secondary" className="text-xs">
          {grants.length}
        </Badge>
      </div>
      <div className="flex flex-col gap-2">
        {grants.map((grant) => (
          <Card key={grant.id} className="shadow-sm">
            <CardHeader className="p-3 pb-1">
              <Link href={`/grants/${grant.id}`} className="hover:underline">
                <CardTitle className="line-clamp-2 text-sm leading-snug">
                  {grant.title}
                </CardTitle>
              </Link>
              <p className="text-xs text-muted-foreground">{grant.agency}</p>
            </CardHeader>
            <CardContent className="space-y-2 p-3 pt-0">
              <div className="flex flex-wrap gap-1">
                <ScoreBadge score={grant.aiScore} size="sm" />
                {grant.deadline && (
                  <Badge variant="outline" className="text-xs">
                    {grant.deadline}
                  </Badge>
                )}
              </div>
              {grant.awardCeiling && (
                <p className="text-xs text-muted-foreground">
                  Up to ${grant.awardCeiling.toLocaleString()}
                </p>
              )}
              <Select
                value={grant.status}
                onValueChange={(val) => onStatusChange(grant.id, val)}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="text-xs capitalize">
                      {s.toLowerCase().replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        ))}
        {grants.length === 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">
            No grants
          </p>
        )}
      </div>
    </div>
  );
}
