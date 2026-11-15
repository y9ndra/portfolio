/** Whether this document arrived at the home page through a return navigation. */
export function isHomeReturnNavigation() {
  const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (!navigation) return false;
  if (navigation.type === "back_forward") return true;
  try { return new URL(navigation.name).pathname !== "/"; } catch { return false; }
}
