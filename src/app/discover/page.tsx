"use client";

import { useState, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GrantCard, type GrantCardGrant } from "@/components/GrantCard";
import { Search } from "lucide-react";

const SUGGESTIONS = [
  "community health",
  "primary care FQHC",
  "behavioral health",
  "substance use",
  "dental underserved",
];

interface ScoreResult {
  score: number;
  verdict: string;
  why: string;
}

export default function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GrantCardGrant[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [scores, setScores] = useState<Record<string, ScoreResult>>({});

  const doSearch = useCallback(async (keywords: string) => {
    setQuery(keywords);
    setSearching(true);
    setSearched(true);
    try {
      const res = await fetch("/api/grants/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      const data = await res.json();
      setResults(data.grants ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSave = async (grant: GrantCardGrant) => {
    // Fetch detail for description + award amounts before saving
    let detail = grant;
    try {
      const detailRes = await fetch(
        `/api/grants/detail?oppId=${grant.id}`
      );
      const detailData = await detailRes.json();
      if (detailData.grant) {
        detail = { ...grant, ...detailData.grant };
      }
    } catch {
      // Save with what we have
    }

    await fetch("/api/grants/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grantId: detail.id,
        title: detail.title,
        agency: detail.agency,
        description: detail.description ?? "",
        deadline: detail.deadline,
        awardFloor: detail.awardFloor,
        awardCeiling: detail.awardCeiling,
        opportunityNumber: detail.opportunityNumber,
      }),
    });
    setSavedIds((prev) => new Set([...prev, grant.id]));
  };

  const handleScore = async (grant: GrantCardGrant) => {
    // Fetch detail for richer context
    let description = grant.description ?? "";
    let awardCeiling = grant.awardCeiling;
    try {
      const detailRes = await fetch(
        `/api/grants/detail?oppId=${grant.id}`
      );
      const detailData = await detailRes.json();
      if (detailData.grant) {
        description = detailData.grant.description || description;
        awardCeiling = detailData.grant.awardCeiling ?? awardCeiling;
      }
    } catch {
      // Score with what we have
    }

    const res = await fetch("/api/ai/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grantId: grant.id,
        grantTitle: grant.title,
        grantDescription: description,
        grantAgency: grant.agency,
        awardCeiling,
      }),
    });
    const data = await res.json();
    if (data.score != null) {
      setScores((prev) => ({
        ...prev,
        [grant.id]: {
          score: data.score,
          verdict: data.verdict,
          why: data.why,
        },
      }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Discover Grants</h1>
        <p className="text-muted-foreground">
          Search Grants.gov for funding opportunities relevant to your FQHC
        </p>
      </div>

      {/* Search */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (query.trim()) doSearch(query.trim());
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for grants..."
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={searching || !query.trim()}>
          Search
        </Button>
      </form>

      {/* Suggestion chips */}
      {!searched && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground">Try:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => doSearch(s)}
              className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {searching && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      )}

      {/* Results */}
      {!searching && results.length > 0 && (
        <div>
          <p className="mb-3 text-sm text-muted-foreground">
            {results.length} results from Grants.gov
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((grant) => (
              <GrantCard
                key={grant.id}
                grant={grant}
                onSave={handleSave}
                onScore={handleScore}
                aiScore={scores[grant.id]?.score}
                aiVerdict={scores[grant.id]?.verdict}
                aiWhy={scores[grant.id]?.why}
                saved={savedIds.has(grant.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* No results */}
      {!searching && searched && results.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No grants found. Try different keywords.
        </p>
      )}
    </div>
  );
}
