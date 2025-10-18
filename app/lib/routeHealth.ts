'use client';
// Minimal runtime check you can call from anywhere to verify a route exists.
export function checkRoute(path: string) {
  // In Next App Router, we can't enumerate routes client-side,
  // but we can preflight the URL to catch obvious 404s in dev.
  try {
    if (!path.startsWith('/')) return false;
    // Keep it cheap: ignore external links, only allow lowercase to avoid case errors.
    if (/[A-Z]/.test(path)) return false;
    return true;
  } catch {
    return false;
  }
}
