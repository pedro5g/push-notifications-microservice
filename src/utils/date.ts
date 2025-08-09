export const dateUtils = {
  now: () => new Date().toISOString(),
  addMinutes: (minutes: number) =>
    new Date(Date.now() + minutes * 60 * 1000).toISOString(),
  addHours: (hours: number) =>
    new Date(Date.now() + hours * 60 * 60 * 1000).toISOString(),
  addDays: (days: number) =>
    new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString(),
  isExpires: (date: Date | string) => new Date(date) <= new Date(),
};
