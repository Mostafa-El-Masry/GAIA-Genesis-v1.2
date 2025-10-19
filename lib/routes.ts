export type RouteItem = { path: string; label: string; icon?: string };
export const ROUTES: RouteItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
  { path: '/apollo',    label: 'Apollo',    icon: '🧠' },
  { path: '/gallery',   label: 'Gallery',   icon: '🖼️' },
  { path: '/wealth',    label: 'Wealth',    icon: '💼' },
  { path: '/health',    label: 'Health',    icon: '🩺' },
  { path: '/timeline',  label: 'Timeline',  icon: '🗓️' },
  { path: '/sync',      label: 'Sync',      icon: '🔄' },
  { path: '/af1',       label: 'AF1',       icon: '🎨' },
];
