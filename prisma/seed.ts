import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config();

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.orgProfile.upsert({
    where: { id: "seed" },
    update: {},
    create: {
      id: "seed",
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
    },
  });

  const seedGrants = [
    {
      grantId: "demo-001",
      title: "HRSA Health Center Quality Improvement",
      agency: "Health Resources & Services Administration",
      description:
        "Funding to support quality improvement initiatives at federally qualified health centers serving underserved populations.",
      deadline: "2026-04-15",
      awardCeiling: 500000,
      awardFloor: 100000,
      opportunityNumber: "HRSA-26-001",
      status: "APPLYING" as const,
      aiScore: 92,
      aiSummary:
        "Extremely strong fit. This grant is purpose-built for FQHCs and directly funds quality improvement work aligned with this organization's clinical profile.",
    },
    {
      grantId: "demo-002",
      title: "Substance Use Prevention and Treatment Block Grant",
      agency: "SAMHSA",
      description:
        "Block grant funding for substance use disorder prevention, treatment, and recovery support services.",
      deadline: "2026-05-01",
      awardCeiling: 250000,
      awardFloor: 50000,
      opportunityNumber: "SAMHSA-26-042",
      status: "RESEARCHING" as const,
      aiScore: 78,
      aiSummary:
        "Strong fit given existing substance use treatment services. Eligibility is favorable; main consideration is matching fund requirements.",
    },
    {
      grantId: "demo-003",
      title: "Community Mental Health Services Block Grant",
      agency: "SAMHSA",
      description:
        "Funding to support comprehensive mental health services for adults with serious mental illness and children with serious emotional disturbances.",
      deadline: "2026-06-30",
      awardCeiling: 175000,
      opportunityNumber: "SAMHSA-26-MH-011",
      status: "QUALIFYING" as const,
      aiScore: 71,
      aiSummary:
        "Good alignment with behavioral health services. Requires state-level coordination which may add complexity.",
    },
  ];

  for (const grant of seedGrants) {
    await prisma.savedGrant.upsert({
      where: { grantId: grant.grantId },
      update: {},
      create: grant,
    });
  }

  console.log("Seed data created successfully");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
