export function cn(...inputs) {
  return inputs
    .flatMap((entry) => {
      if (!entry) return [];
      if (typeof entry === "string") return [entry];
      if (Array.isArray(entry)) return entry.filter(Boolean);
      if (typeof entry === "object") {
        return Object.entries(entry)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .join(" ");
}
