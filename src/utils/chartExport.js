// Shared helper for downloading any Chart.js chart as a clean, presentation-ready
// PNG: solid white background, a title, the date/time it was generated, and the
// same labeled x/y axes shown on screen — regardless of the app's current theme.

export const whiteBackgroundPlugin = {
  id: 'avexiWhiteBg',
  beforeDraw(chart) {
    const { ctx, width, height } = chart;
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
};

/**
 * @param {(ctx: CanvasRenderingContext2D, colors: object) => object} buildConfig
 *   Pure function returning a Chart.js config using the supplied color palette.
 * @param {object} opts
 * @param {string} opts.filename
 * @param {string} opts.title
 */
export const downloadChartPng = (buildConfig, { filename, title }) => {
  if (!window.Chart) return;

  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 620;
  const ctx = canvas.getContext('2d');

  const EXPORT_COLORS = {
    text: '#10201a',
    muted: '#55705f',
    border: 'rgba(17,28,23,.15)',
    surface: '#ffffff',
    green: '#2a7a3a',
    red: '#b03020',
    blue: '#1a5a8a',
    amber: '#956b10'
  };

  const config = buildConfig(ctx, EXPORT_COLORS);
  config.plugins = [...(config.plugins || []), whiteBackgroundPlugin];
  config.options = {
    ...config.options,
    responsive: false,
    animation: false,
    devicePixelRatio: 2,
    layout: { padding: { top: 56, bottom: 8, left: 8, right: 8 } },
    plugins: {
      ...(config.options?.plugins || {}),
      title: {
        display: true,
        text: [title, `Downloaded ${new Date().toLocaleString('en-KE')}`],
        color: EXPORT_COLORS.text,
        font: { size: 16, weight: '700' },
        padding: { bottom: 10 }
      }
    }
  };

  const chart = new window.Chart(ctx, config);
  requestAnimationFrame(() => {
    const url = chart.toBase64Image('image/png', 1);
    chart.destroy();
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
};
