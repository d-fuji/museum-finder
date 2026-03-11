import { describe, it, expect } from "vitest";
import { CATEGORY_LABEL, calculateAverageRating } from "@/lib/museum-utils";

describe("CATEGORY_LABEL", () => {
  it("should have label for CORPORATE", () => {
    expect(CATEGORY_LABEL.CORPORATE).toBe("企業博物館");
  });

  it("should have label for CITY_HISTORY", () => {
    expect(CATEGORY_LABEL.CITY_HISTORY).toBe("市の歴史館");
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
