export function clean(value) {
  return typeof value === "string" ? value.trim() : "";
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseLimit(value, fallback = 250, max = 250) {
  const parsedLimit = Number.parseInt(value ?? String(fallback), 10);
  return Number.isNaN(parsedLimit) ? fallback : Math.min(Math.max(parsedLimit, 1), max);
}

export function appendNumberWhenNeeded(value, totalItems, index) {
  return totalItems > 1 ? `${value} ${index + 1}` : value;
}
