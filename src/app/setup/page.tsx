"use client";

import { useRouter } from "next/navigation";
import { OrgProfileForm } from "@/components/OrgProfileForm";

export default function SetupPage() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Organization Setup</h1>
        <p className="text-muted-foreground">
          Configure your FQHC profile to personalize AI grant scoring
        </p>
      </div>
      <OrgProfileForm onSaved={() => router.push("/discover")} />
    </div>
  );
}
