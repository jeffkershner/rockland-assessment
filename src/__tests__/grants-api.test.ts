import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchGrants, fetchGrantDetail } from "@/lib/grants-api";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  mockFetch.mockReset();
});

describe("searchGrants", () => {
  it("returns mapped grant results from Grants.gov", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          oppHits: [
            {
              id: "12345",
              number: "HRSA-26-001",
              title: "Health Center &ndash; Quality Improvement",
              agency: "HRSA",
              openDate: "01/15/2026",
              closeDate: "04/15/2026",
              oppStatus: "posted",
            },
            {
              id: 67890,
              number: "SAMHSA-26-042",
              title: "Substance Use &amp; Prevention Grant",
              agency: "SAMHSA",
              openDate: "02/01/2026",
              closeDate: "",
              oppStatus: "forecasted",
            },
          ],
        },
      }),
    });

    const results = await searchGrants("FQHC");

    expect(results).toHaveLength(2);

    // Verifies ID is always a string
    expect(results[0].id).toBe("12345");
    expect(results[1].id).toBe("67890");

    // Verifies HTML entities are decoded
    expect(results[0].title).toBe("Health Center – Quality Improvement");
    expect(results[1].title).toBe("Substance Use & Prevention Grant");

    // Verifies field mapping
    expect(results[0].opportunityNumber).toBe("HRSA-26-001");
    expect(results[0].agency).toBe("HRSA");
    expect(results[0].deadline).toBe("04/15/2026");
    expect(results[0].status).toBe("posted");

    // Empty closeDate maps to null
    expect(results[1].deadline).toBeNull();

    // Search results don't include description or award amounts
    expect(results[0].description).toBe("");
    expect(results[0].awardFloor).toBeNull();
    expect(results[0].awardCeiling).toBeNull();
  });

  it("sends correct request to Grants.gov search2 API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { oppHits: [] } }),
    });

    await searchGrants("behavioral health", 10);

    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.grants.gov/v1/api/search2",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          keyword: "behavioral health",
          oppStatuses: "posted|forecasted",
          rows: 10,
          startRecordNum: 0,
        }),
      })
    );
  });

  it("returns empty array when no results", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { oppHits: [] } }),
    });

    const results = await searchGrants("xyznonexistent");
    expect(results).toEqual([]);
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503 });

    await expect(searchGrants("test")).rejects.toThrow(
      "Grants.gov search error: 503"
    );
  });

  it("handles missing fields gracefully", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        data: {
          oppHits: [{ id: "1" }], // minimal hit — all other fields missing
        },
      }),
    });

    const results = await searchGrants("test");
    expect(results[0]).toEqual({
      id: "1",
      title: "Untitled",
      agency: "Unknown Agency",
      description: "",
      deadline: null,
      awardFloor: null,
      awardCeiling: null,
      opportunityNumber: "",
      status: "posted",
      postedDate: "",
    });
  });
});

describe("fetchGrantDetail", () => {
  it("returns full grant details with parsed synopsis", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 361494,
        opportunityTitle: "MAHA &ndash; ELEVATE",
        opportunityNumber: "CMS-2W2-27-001",
        owningAgencyCode: "HHS-CMS",
        listed: "L",
        synopsis: {
          synopsisDesc: "<p>This grant funds <b>health centers</b>.</p>",
          agencyDetails: { agencyName: "Center for Medicare and Medicaid Services" },
          responseDate: "May 15, 2026",
          awardFloor: 100000,
          awardCeiling: 3300000,
          postDate: "Mar 13, 2026",
        },
      }),
    });

    const result = await fetchGrantDetail("361494");

    expect(result).not.toBeNull();
    expect(result!.id).toBe("361494");
    expect(result!.title).toBe("MAHA – ELEVATE");
    expect(result!.agency).toBe("Center for Medicare and Medicaid Services");
    expect(result!.opportunityNumber).toBe("CMS-2W2-27-001");
    expect(result!.awardFloor).toBe(100000);
    expect(result!.awardCeiling).toBe(3300000);
    expect(result!.deadline).toBe("May 15, 2026");
    expect(result!.status).toBe("posted");

    // HTML should be stripped from description
    expect(result!.description).not.toContain("<p>");
    expect(result!.description).not.toContain("<b>");
    expect(result!.description).toContain("health centers");
  });

  it("sends form-encoded POST to legacy API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        opportunityTitle: "Test",
        synopsis: {},
      }),
    });

    await fetchGrantDetail("12345");

    expect(mockFetch).toHaveBeenCalledWith(
      "https://apply07.grants.gov/grantsws/rest/opportunity/details",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: "oppId=12345",
      })
    );
  });

  it("returns null on API error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    const result = await fetchGrantDetail("999999");
    expect(result).toBeNull();
  });

  it("handles missing synopsis fields", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        id: 1,
        listed: "F",
        // no synopsis, no title, no opportunityNumber
      }),
    });

    const result = await fetchGrantDetail("1");
    expect(result!.title).toBe("Untitled");
    expect(result!.description).toBe("");
    expect(result!.awardFloor).toBeNull();
    expect(result!.awardCeiling).toBeNull();
    expect(result!.status).toBe("forecasted");
  });
});
