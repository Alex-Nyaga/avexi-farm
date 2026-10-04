import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getThemeColors } from '../utils/chartTheme';
import { downloadChartPng } from '../utils/chartExport';
import ChartDownloadButton from './ChartDownloadButton';

const DOUGHNUT_PALETTE = ['#3a7abf', '#2a7a3a', '#bf8a3a', '#8a3abf', '#5aaf3a', '#b03020', '#4a8abf', '#d4960a'];

const buildCowSeries = (db) => {
  const milkByCow = {};
  db.milkRecords.forEach(record => {
    if (!milkByCow[record.cowTag]) {
      milkByCow[record.cowTag] = 0;
    }
    milkByCow[record.cowTag] += Number(record.am || 0) + Number(record.pm || 0);
  });
  const cowTags = Object.keys(milkByCow);
  return { cowTags, milkData: cowTags.map(tag => milkByCow[tag]) };
};

const MilkProductionChart = () => {
  const { db, theme } = useApp();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    // Check if Chart.js is loaded
    if (window.Chart) {
      setChartLoaded(true);
    } else {
      // Wait for Chart.js to load
      const checkInterval = setInterval(() => {
        if (window.Chart) {
          setChartLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  useEffect(() => {
    if (!chartRef.current || !window.Chart || !chartLoaded) return;

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const { cowTags, milkData } = buildCowSeries(db);
    const colors = getThemeColors();
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: cowTags,
        datasets: [{
          data: milkData,
          backgroundColor: DOUGHNUT_PALETTE,
          borderWidth: 2,
          borderColor: colors.surface,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 200,
        animation: { duration: 500 },
        plugins: {
          legend: {
            position: window.innerWidth < 620 ? 'bottom' : 'right',
            labels: {
              color: colors.text,
              padding: 15,
              font: { size: 11 }
            }
          },
          tooltip: {
            backgroundColor: colors.surface,
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                return `${label}: ${value.toFixed(1)}L (${percentage}%)`;
              }
            }
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [db.milkRecords, theme, chartLoaded]);

  const handleDownload = () => {
    const { cowTags, milkData } = buildCowSeries(db);
    downloadChartPng((ctx, colors) => ({
      type: 'doughnut',
      data: {
        labels: cowTags,
        datasets: [{ data: milkData, backgroundColor: DOUGHNUT_PALETTE, borderWidth: 2, borderColor: colors.surface }]
      },
      options: {
        plugins: {
          legend: { position: 'right', labels: { color: colors.text } }
        }
      }
    }), { filename: 'milk-by-cow-chart.png', title: 'Avexi Farm — Milk Production by Cow' });
  };

  if (!chartLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '250px',
        color: 'var(--text-muted)'
      }}>
        Loading chart...
      </div>
    );
  }

  if (db.milkRecords.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">Milk</div>
        No milk data to display chart
      </div>
    );
  }

  return (
    <div className="chart-card">
      <ChartDownloadButton onClick={handleDownload} />
      <div className="chart-shell chart-shell--doughnut">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default MilkProductionChart;