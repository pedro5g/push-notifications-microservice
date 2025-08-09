import { dateUtils } from "./date";

describe("dateUtils", () => {
  describe("now", () => {
    it("should returns the current date in ISO string", () => {
      const now = new Date();
      const result = dateUtils.now();

      expect(new Date(result).getTime()).toBeGreaterThanOrEqual(now.getTime());
      expect(typeof result).toBe("string");
    });
  });

  describe("addMinutes", () => {
    it("should add the correct minutes to current date", () => {
      const minutesToAdd = 10;
      const expected = new Date(
        Date.now() + minutesToAdd * 60 * 1000
      ).toISOString();
      const result = dateUtils.addMinutes(minutesToAdd);
      expect(result).toBe(expected);
    });

    it("should works with negative minutes", () => {
      const minutesToAdd = -15;
      const expected = new Date(
        Date.now() + minutesToAdd * 60 * 1000
      ).toISOString();
      const result = dateUtils.addMinutes(minutesToAdd);
      expect(result).toBe(expected);
    });
  });

  describe("addHours", () => {
    it("should add the correctly hours to current date", () => {
      const hoursToAdd = 2;
      const expected = new Date(
        Date.now() + hoursToAdd * 60 * 60 * 1000
      ).toISOString();
      const result = dateUtils.addHours(hoursToAdd);
      expect(result).toBe(expected);
    });

    it("should works with negative hours", () => {
      const hoursToAdd = -3;
      const expected = new Date(
        Date.now() + hoursToAdd * 60 * 60 * 1000
      ).toISOString();
      const result = dateUtils.addHours(hoursToAdd);
      expect(result).toBe(expected);
    });
  });

  describe("addDays", () => {
    it("should add the correctly days to current date", () => {
      const daysToAdd = 1;
      const expected = new Date(
        Date.now() + daysToAdd * 24 * 60 * 60 * 1000
      ).toISOString();
      const result = dateUtils.addDays(daysToAdd);
      expect(result).toBe(expected);
    });

    it("should works with negative days", () => {
      const daysToAdd = -2;
      const expected = new Date(
        Date.now() + daysToAdd * 24 * 60 * 60 * 1000
      ).toISOString();
      const result = dateUtils.addDays(daysToAdd);
      expect(result).toBe(expected);
    });
  });

  describe("isExpires", () => {
    it("should returns true if will be past", () => {
      const pastDate = new Date(Date.now() - 1000).toISOString();
      expect(dateUtils.isExpires(pastDate)).toBe(true);
    });

    it("should returns false if will be future", () => {
      const futureDate = new Date(Date.now() + 1000 * 60).toISOString();
      expect(dateUtils.isExpires(futureDate)).toBe(false);
    });

    it("should accept recibe a date object or string", () => {
      const date = new Date(Date.now() - 5000);
      expect(dateUtils.isExpires(date)).toBe(true);

      const dateStr = new Date(Date.now() + 5000).toISOString();
      expect(dateUtils.isExpires(dateStr)).toBe(false);
    });
  });
});
