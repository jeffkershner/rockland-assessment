import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    orgProfile: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    savedGrant: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      updateMany: vi.fn(),
    },
  },
}));
vi.mock("@/lib/grants-api", () => ({
  searchGrants: vi.fn(),
}));

import { POST as searchPost } from "@/app/api/grants/search/route";
import { POST as savePost, GET as saveGet } from "@/app/api/grants/save/route";
import { PATCH, DELETE } from "@/app/api/grants/[id]/route";
import { GET as profileGet, POST as profilePost } from "@/app/api/profile/route";
import { searchGrants } from "@/lib/grants-api";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

const mockPrisma = vi.mocked(prisma);

function makeRequest(body: unknown, method = "POST") {
  return new NextRequest("http://localhost:3000/api/test", {
    method,
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

// --- Grant Search ---
describe("POST /api/grants/search", () => {
  it("returns 400 when keywords are empty", async () => {
    const res = await searchPost(makeRequest({ keywords: "" }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("keywords required");
  });

  it("returns 400 when keywords are missing", async () => {
    const res = await searchPost(makeRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns grants from Grants.gov", async () => {
    const mockGrants = [
      { id: "1", title: "Test Grant", agency: "HRSA" },
    ];
    vi.mocked(searchGrants).mockResolvedValueOnce(mockGrants as any);

    const res = await searchPost(makeRequest({ keywords: "FQHC" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.grants).toEqual(mockGrants);
    expect(searchGrants).toHaveBeenCalledWith("FQHC");
  });

  it("returns 500 on unexpected error", async () => {
    vi.mocked(searchGrants).mockRejectedValueOnce(new Error("Network error"));

    const res = await searchPost(makeRequest({ keywords: "test" }));
    expect(res.status).toBe(500);
  });
});

// --- Grant Save / List ---
describe("POST /api/grants/save", () => {
  it("upserts a grant with RESEARCHING status", async () => {
    const grantData = {
      grantId: "123",
      title: "Test Grant",
      agency: "HRSA",
      description: "A grant",
    };
    mockPrisma.savedGrant.upsert.mockResolvedValueOnce({
      id: "abc",
      ...grantData,
      status: "RESEARCHING",
    });

    const res = await savePost(makeRequest(grantData));
    expect(res.status).toBe(200);

    expect(mockPrisma.savedGrant.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { grantId: "123" },
        create: expect.objectContaining({
          grantId: "123",
          status: "RESEARCHING",
        }),
        update: {},
      })
    );
  });
});

describe("GET /api/grants/save", () => {
  it("returns all saved grants", async () => {
    const grants = [
      { id: "1", title: "Grant A", status: "RESEARCHING" },
      { id: "2", title: "Grant B", status: "APPLYING" },
    ];
    mockPrisma.savedGrant.findMany.mockResolvedValueOnce(grants);

    const res = await saveGet();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.grants).toHaveLength(2);
  });
});

// --- Grant Update / Delete ---
describe("PATCH /api/grants/[id]", () => {
  it("updates a grant's status", async () => {
    mockPrisma.savedGrant.update.mockResolvedValueOnce({
      id: "abc",
      status: "APPLYING",
    });

    const req = makeRequest({ status: "APPLYING" }, "PATCH");
    const res = await PATCH(req, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(200);

    expect(mockPrisma.savedGrant.update).toHaveBeenCalledWith({
      where: { id: "abc" },
      data: { status: "APPLYING" },
    });
  });

  it("returns 500 when grant not found", async () => {
    mockPrisma.savedGrant.update.mockRejectedValueOnce(
      new Error("Record not found")
    );

    const req = makeRequest({ status: "APPLYING" }, "PATCH");
    const res = await PATCH(req, {
      params: Promise.resolve({ id: "nonexistent" }),
    });
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/grants/[id]", () => {
  it("deletes a grant and returns ok", async () => {
    mockPrisma.savedGrant.delete.mockResolvedValueOnce({});

    const req = new NextRequest("http://localhost:3000/api/grants/abc", {
      method: "DELETE",
    });
    const res = await DELETE(req, {
      params: Promise.resolve({ id: "abc" }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});

// --- Profile ---
describe("GET /api/profile", () => {
  it("returns null when no profile exists", async () => {
    mockPrisma.orgProfile.findFirst.mockResolvedValueOnce(null);

    const res = await profileGet();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.profile).toBeNull();
  });

  it("returns existing profile", async () => {
    const profile = { id: "1", name: "Test FQHC", state: "CA" };
    mockPrisma.orgProfile.findFirst.mockResolvedValueOnce(profile);

    const res = await profileGet();
    const data = await res.json();
    expect(data.profile.name).toBe("Test FQHC");
  });
});

describe("POST /api/profile", () => {
  it("creates profile when none exists", async () => {
    mockPrisma.orgProfile.findFirst.mockResolvedValueOnce(null);
    const newProfile = { name: "New FQHC", state: "NY" };
    mockPrisma.orgProfile.create.mockResolvedValueOnce({
      id: "1",
      ...newProfile,
    });

    const res = await profilePost(makeRequest(newProfile));
    expect(res.status).toBe(200);
    expect(mockPrisma.orgProfile.create).toHaveBeenCalledWith({
      data: newProfile,
    });
  });

  it("updates profile when one exists", async () => {
    mockPrisma.orgProfile.findFirst.mockResolvedValueOnce({
      id: "existing",
      name: "Old Name",
    });
    const updated = { name: "Updated FQHC" };
    mockPrisma.orgProfile.update.mockResolvedValueOnce({
      id: "existing",
      ...updated,
    });

    const res = await profilePost(makeRequest(updated));
    expect(res.status).toBe(200);
    expect(mockPrisma.orgProfile.update).toHaveBeenCalledWith({
      where: { id: "existing" },
      data: updated,
    });
  });
});
