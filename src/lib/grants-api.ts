const SEARCH_API = "https://api.grants.gov/v1/api/search2";
const DETAIL_API =
  "https://apply07.grants.gov/grantsws/rest/opportunity/details";

export interface GrantResult {
  id: string;
  title: string;
  agency: string;
  description: string;
  deadline: string | null;
  awardFloor: number | null;
  awardCeiling: number | null;
  opportunityNumber: string;
  status: string;
  postedDate: string;
}

interface SearchHit {
  id: string | number;
  number?: string;
  title?: string;
  agency?: string;
  openDate?: string;
  closeDate?: string;
  oppStatus?: string;
}


export async function searchGrants(
  keywords: string,
  rows = 25
): Promise<GrantResult[]> {
  const body = {
    keyword: keywords,
    oppStatuses: "posted|forecasted",
    rows,
    startRecordNum: 0,
  };

  const res = await fetch(SEARCH_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Grants.gov search error: ${res.status}`);

  const data = await res.json();
  const hits: SearchHit[] = data?.data?.oppHits ?? [];

  return hits.map(
    (h): GrantResult => ({
      id: String(h.id),
      title: (h.title ?? "Untitled").replace(/&ndash;/g, "–").replace(/&amp;/g, "&"),
      agency: h.agency ?? "Unknown Agency",
      description: "",
      deadline: h.closeDate || null,
      awardFloor: null,
      awardCeiling: null,
      opportunityNumber: h.number ?? "",
      status: h.oppStatus ?? "posted",
      postedDate: h.openDate ?? "",
    })
  );
}


export async function fetchGrantDetail(
  oppId: string
): Promise<GrantResult | null> {
  const res = await fetch(DETAIL_API, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `oppId=${oppId}`,
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;

  const d = await res.json();
  const syn = d.synopsis ?? {};

  // Strip HTML tags from synopsis description
  const rawDesc: string = syn.synopsisDesc ?? "";
  const description = rawDesc.replace(/<[^>]*>/g, " ").replace(/&\w+;/g, " ").replace(/\s+/g, " ").trim();

  return {
    id: String(d.id),
    title: (d.opportunityTitle ?? "Untitled").replace(/&ndash;/g, "–").replace(/&amp;/g, "&"),
    agency: syn.agencyDetails?.agencyName ?? d.owningAgencyCode ?? "Unknown",
    description,
    deadline: syn.responseDate ?? null,
    awardFloor: syn.awardFloor ? Number(syn.awardFloor) : null,
    awardCeiling: syn.awardCeiling ? Number(syn.awardCeiling) : null,
    opportunityNumber: d.opportunityNumber ?? "",
    status: d.listed === "L" ? "posted" : "forecasted",
    postedDate: syn.postDate ?? "",
  };
}
