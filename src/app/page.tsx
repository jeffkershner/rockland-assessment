"use client";

import { useEffect, useState, useCallback } from "react";
import { PipelineColumn } from "@/components/PipelineColumn";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowRight, DollarSign, Trophy, Calendar, Layers } from "lucide-react";

const PIPELINE_STATUSES = [
  "RESEARCHING",
  "QUALIFYING",
  "APPLYING",
  "SUBMITTED",
  "AWARDED",
];

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

export default function DashboardPage() {
  const [grants, setGrants] = useState<PipelineGrant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGrants = useCallback(async () => {
    const res = await fetch("/api/grants/save");
    const data = await res.json();
    setGrants(data.grants ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    // Optimistic update
    setGrants((prev) =>
      prev.map((g) => (g.id === id ? { ...g, status: newStatus } : g))
    );
    await fetch(`/api/grants/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  };

  const activeGrants = grants.filter((g) => g.status !== "DECLINED");
  const totalValue = activeGrants.reduce(
    (sum, g) => sum + (g.awardCeiling ?? 0),
    0
  );
  const highestScore = activeGrants.reduce(
    (max, g) => Math.max(max, g.aiScore ?? 0),
    0
  );
  const deadlineSoon = activeGrants.filter((g) => {
    if (!g.deadline) return false;
    try {
      const d = new Date(g.deadline);
      const diff = (d.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return diff > 0 && diff <= 30;
    } catch {
      return false;
    }
  }).length;

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-96 w-72 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (grants.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-emerald-50 p-4">
          <Layers className="h-8 w-8 text-emerald-600" />
        </div>
        <h2 className="text-xl font-semibold">Your pipeline is empty</h2>
        <p className="max-w-sm text-muted-foreground">
          Search for grants and add them to your pipeline to track your
          application progress.
        </p>
        <Link
          href="/discover"
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          Discover grants <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Layers className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{activeGrants.length}</p>
              <p className="text-xs text-muted-foreground">Active grants</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Calendar className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-2xl font-bold">{deadlineSoon}</p>
              <p className="text-xs text-muted-foreground">Due this month</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Trophy className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold">{highestScore || "–"}</p>
              <p className="text-xs text-muted-foreground">Highest AI score</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <DollarSign className="h-5 w-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {totalValue > 0 ? `$${(totalValue / 1_000_000).toFixed(1)}M` : "–"}
              </p>
              <p className="text-xs text-muted-foreground">Potential value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {PIPELINE_STATUSES.map((status) => (
          <PipelineColumn
            key={status}
            status={status}
            grants={grants.filter((g) => g.status === status)}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}
