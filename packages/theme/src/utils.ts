export function toCSSRules(camelCase: Record<string, string | number>) {
  return Object.fromEntries(
    Object.entries(camelCase).map(([key, value]) => [key.replace(/([A-Z])/g, '-$1').toLowerCase(), value]),
  );
}
