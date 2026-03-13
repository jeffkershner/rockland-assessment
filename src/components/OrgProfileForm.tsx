"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const DEFAULT_PROFILE = {
  name: "Mission Community Health Center",
  clinicalFocus:
    "primary care, behavioral health, dental, substance use treatment",
  populationServed:
    "low-income adults and families, unhoused individuals, Medicaid and uninsured patients",
  annualBudget: "$8M",
  staffCount: "120",
  state: "CA",
  existingGrants:
    "HRSA Health Center Program, Ryan White, ACS Lung Cancer Screening",
};

interface OrgProfileFormProps {
  onSaved?: () => void;
}

export function OrgProfileForm({ onSaved }: OrgProfileFormProps) {
  const [form, setForm] = useState(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setForm({
            name: data.profile.name,
            clinicalFocus: data.profile.clinicalFocus,
            populationServed: data.profile.populationServed,
            annualBudget: data.profile.annualBudget,
            staffCount: data.profile.staffCount,
            state: data.profile.state,
            existingGrants: data.profile.existingGrants,
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      onSaved?.();
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Organization Profile</CardTitle>
        <p className="text-sm text-muted-foreground">
          This information helps the AI score grants for relevance to your
          organization.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Organization Name</label>
            <Input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Clinical Focus</label>
            <Textarea
              value={form.clinicalFocus}
              onChange={(e) => update("clinicalFocus", e.target.value)}
              placeholder="e.g. primary care, behavioral health, dental"
              rows={2}
            />
          </div>
          <div>
            <label className="text-sm font-medium">Population Served</label>
            <Textarea
              value={form.populationServed}
              onChange={(e) => update("populationServed", e.target.value)}
              placeholder="e.g. low-income, unhoused, Medicaid patients"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Annual Budget</label>
              <Input
                value={form.annualBudget}
                onChange={(e) => update("annualBudget", e.target.value)}
                placeholder="e.g. $8M"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Staff Count</label>
              <Input
                value={form.staffCount}
                onChange={(e) => update("staffCount", e.target.value)}
                placeholder="e.g. 120"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">State</label>
            <Input
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
              placeholder="e.g. CA"
              maxLength={2}
              className="w-24"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Current Funders/Grants</label>
            <Textarea
              value={form.existingGrants}
              onChange={(e) => update("existingGrants", e.target.value)}
              placeholder="e.g. HRSA Health Center Program, Ryan White"
              rows={2}
            />
          </div>
          <Button type="submit" disabled={saving} className="w-full">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
