import { describe, it, expect } from "vitest";
import {
  CATEGORY_LABEL,
  calculateAverageRating,
  toMuseumSummary,
  toOperatingHours,
  toBookmark,
  toBookmarkWithMuseum,
} from "@/lib/museum-utils";

describe("CATEGORY_LABEL", () => {
  it("should have label for CORPORATE_MUSEUM", () => {
    expect(CATEGORY_LABEL.CORPORATE_MUSEUM).toBe("企業ミュージアム");
  });

  it("should have label for HISTORY_MUSEUM", () => {
    expect(CATEGORY_LABEL.HISTORY_MUSEUM).toBe("歴史・郷土資料館");
  });

  it("should have label for SCIENCE_MUSEUM", () => {
    expect(CATEGORY_LABEL.SCIENCE_MUSEUM).toBe("科学・技術館");
  });

  it("should have label for INDUSTRIAL_HERITAGE", () => {
    expect(CATEGORY_LABEL.INDUSTRIAL_HERITAGE).toBe("産業遺産");
  });

  it("should have label for FACTORY_TOUR", () => {
    expect(CATEGORY_LABEL.FACTORY_TOUR).toBe("工場見学");
  });

  it("should have label for CASTLE", () => {
    expect(CATEGORY_LABEL.CASTLE).toBe("城・城郭");
  });

  it("should have exactly 6 categories", () => {
    expect(Object.keys(CATEGORY_LABEL)).toHaveLength(6);
  });
});

describe("calculateAverageRating", () => {
  it("should return 0 when reviews is empty", () => {
    const result = calculateAverageRating([]);

    expect(result).toBe(0);
  });

  it("should return the rating when there is one review", () => {
    const result = calculateAverageRating([{ rating: 4 }]);

    expect(result).toBe(4);
  });

  it("should return rounded average when there are multiple reviews", () => {
    const result = calculateAverageRating([{ rating: 5 }, { rating: 4 }, { rating: 3 }]);

    expect(result).toBe(4);
  });

  it("should round to one decimal place", () => {
    const result = calculateAverageRating([{ rating: 5 }, { rating: 3 }]);

    expect(result).toBe(4);
  });

  it("should handle non-integer averages with rounding", () => {
    const result = calculateAverageRating([{ rating: 5 }, { rating: 4 }, { rating: 4 }]);

    expect(result).toBe(4.3);
  });
});

describe("toMuseumSummary", () => {
  const baseMuseum = {
    id: 1,
    name: "テスト博物館",
    category: "CORPORATE_MUSEUM",
    description: "説明",
    latitude: 35.0,
    longitude: 135.0,
    address: "東京都",
    websiteUrl: "https://example.com",
    admissionFee: null,
    isClosed: false,
    closedMessage: null,
    reviews: [{ rating: 4 }],
    tags: [{ id: 1, name: "港町" }],
  };

  it("should include admissionFee when present", () => {
    const museum = { ...baseMuseum, admissionFee: 500 };
    const result = toMuseumSummary(museum);
    expect(result.admissionFee).toBe(500);
  });

  it("should set admissionFee to undefined when null", () => {
    const result = toMuseumSummary(baseMuseum);
    expect(result.admissionFee).toBeUndefined();
  });

  it("should include isClosed", () => {
    const museum = { ...baseMuseum, isClosed: true };
    const result = toMuseumSummary(museum);
    expect(result.isClosed).toBe(true);
  });

  it("should include closedMessage when present", () => {
    const museum = { ...baseMuseum, isClosed: true, closedMessage: "改装中" };
    const result = toMuseumSummary(museum);
    expect(result.closedMessage).toBe("改装中");
  });

  it("should set closedMessage to undefined when null", () => {
    const result = toMuseumSummary(baseMuseum);
    expect(result.closedMessage).toBeUndefined();
  });
});

describe("toOperatingHours", () => {
  it("should map operating hours row to API type", () => {
    const row = {
      id: 1,
      museumId: 10,
      dayOfWeek: 2,
      openTime: "09:00",
      closeTime: "17:00",
      isClosed: false,
      note: "最終入館16:30",
    };

    const result = toOperatingHours(row);

    expect(result).toEqual({
      id: 1,
      museumId: 10,
      dayOfWeek: 2,
      openTime: "09:00",
      closeTime: "17:00",
      isClosed: false,
      note: "最終入館16:30",
    });
  });

  it("should set note to undefined when null", () => {
    const row = {
      id: 1,
      museumId: 10,
      dayOfWeek: 1,
      openTime: "09:00",
      closeTime: "17:00",
      isClosed: true,
      note: null,
    };

    const result = toOperatingHours(row);
    expect(result.note).toBeUndefined();
  });
});

describe("toBookmark", () => {
  it("should map bookmark row to API type", () => {
    const row = {
      id: 1,
      userId: "user-1",
      museumId: 10,
      status: "WANT_TO_GO" as const,
      visitedAt: null,
      createdAt: new Date("2025-03-01T00:00:00Z"),
      updatedAt: new Date("2025-03-01T00:00:00Z"),
    };

    const result = toBookmark(row);

    expect(result).toEqual({
      id: 1,
      userId: "user-1",
      museumId: 10,
      status: "WANT_TO_GO",
      visitedAt: undefined,
      createdAt: "2025-03-01T00:00:00.000Z",
      updatedAt: "2025-03-01T00:00:00.000Z",
    });
  });

  it("should include visitedAt when present", () => {
    const row = {
      id: 2,
      userId: "user-1",
      museumId: 10,
      status: "VISITED" as const,
      visitedAt: new Date("2025-02-15"),
      createdAt: new Date("2025-03-01T00:00:00Z"),
      updatedAt: new Date("2025-03-01T00:00:00Z"),
    };

    const result = toBookmark(row);
    expect(result.visitedAt).toBe("2025-02-15");
  });
});

describe("toBookmarkWithMuseum", () => {
  const baseMuseum = {
    id: 10,
    name: "テスト博物館",
    category: "CORPORATE_MUSEUM" as const,
    description: null,
    latitude: 35.0,
    longitude: 135.0,
    address: null,
    websiteUrl: null,
    admissionFee: null,
    isClosed: false,
    closedMessage: null,
    reviews: [{ rating: 4 }],
    tags: [{ id: 1, name: "港町" }],
  };

  it("should include museum summary with bookmark", () => {
    const row = {
      id: 1,
      userId: "user-1",
      museumId: 10,
      status: "WANT_TO_GO" as const,
      visitedAt: null,
      createdAt: new Date("2025-03-01T00:00:00Z"),
      updatedAt: new Date("2025-03-01T00:00:00Z"),
      museum: baseMuseum,
    };

    const result = toBookmarkWithMuseum(row);

    expect(result.museum.id).toBe(10);
    expect(result.museum.name).toBe("テスト博物館");
    expect(result.museum.averageRating).toBe(4);
    expect(result.status).toBe("WANT_TO_GO");
  });
});
