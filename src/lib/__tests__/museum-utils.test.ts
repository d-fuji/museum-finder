import { describe, it, expect } from "vitest";
import { CATEGORY_LABEL, calculateAverageRating } from "@/lib/museum-utils";

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
