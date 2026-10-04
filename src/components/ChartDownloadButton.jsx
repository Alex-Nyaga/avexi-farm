import React from 'react';

// Small "Save chart" button shown in the corner of every chart, so downloads
// always produce a clean white-background PNG with labeled axes and a
// timestamp — instead of users screenshotting a transparent/dark canvas.
const ChartDownloadButton = ({ onClick, label = 'Save chart' }) => (
  <button type="button" className="chart-download-btn" onClick={onClick} title={label}>
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v12" />
      <path d="M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
    <span>{label}</span>
  </button>
);

export default ChartDownloadButton;
