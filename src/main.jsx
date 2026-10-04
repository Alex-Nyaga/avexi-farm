import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Chart from 'chart.js/auto'
import { jsPDF } from 'jspdf'
import { applyPlugin } from 'jspdf-autotable'
import App from './App.jsx'

// Bundled locally (not loaded from a CDN) so charts and PDFs also work offline.
applyPlugin(jsPDF)
window.Chart = Chart
window.jspdf = { jsPDF }

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}
