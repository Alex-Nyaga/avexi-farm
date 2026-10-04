// Central source of chart colors so canvases always match the app's CSS theme
// (fixes dark-mode charts using colors that clashed with the surrounding text/UI).

const FALLBACK = {
  text: '#10201a',
  muted: '#55705f',
  border: 'rgba(17,28,23,.10)',
  surface: '#ffffff',
  green: '#2a7a3a',
  red: '#b03020',
  blue: '#1a5a8a',
  amber: '#956b10'
};

export const getCssVar = (name, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
};

// Reads the *live* CSS custom properties so chart text/grid colors always
// match the rest of the UI in both light and dark mode.
export const getThemeColors = () => ({
  text: getCssVar('--text', FALLBACK.text),
  muted: getCssVar('--muted', FALLBACK.muted),
  border: getCssVar('--border', FALLBACK.border),
  surface: getCssVar('--surface', FALLBACK.surface),
  green: getCssVar('--green', FALLBACK.green),
  red: getCssVar('--red', FALLBACK.red),
  blue: getCssVar('--blue', FALLBACK.blue),
  amber: getCssVar('--amber', FALLBACK.amber)
});

// Fixed, high-contrast palette used only when exporting/downloading a chart,
// so the saved image always reads clearly on the white background it is
// printed onto — regardless of which theme the user was viewing on screen.
export const EXPORT_COLORS = { ...FALLBACK };
