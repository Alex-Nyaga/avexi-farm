import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getThemeColors } from '../utils/chartTheme';
import { downloadChartPng } from '../utils/chartExport';
import ChartDownloadButton from './ChartDownloadButton';

const buildMilkSeries = (db) => {
  const milkByDate = {};
  db.milkRecords.forEach(record => {
    if (!milkByDate[record.date]) {
      milkByDate[record.date] = { am: 0, pm: 0, sold: 0 };
    }
    milkByDate[record.date].am += Number(record.am || 0);
    milkByDate[record.date].pm += Number(record.pm || 0);
    milkByDate[record.date].sold += Number(record.soldLitres || 0);
  });

  const sortedDates = Object.keys(milkByDate).sort();
  return {
    labels: sortedDates,
    amData: sortedDates.map(date => milkByDate[date].am),
    pmData: sortedDates.map(date => milkByDate[date].pm),
    totalData: sortedDates.map(date => milkByDate[date].am + milkByDate[date].pm),
    soldData: sortedDates.map(date => milkByDate[date].sold)
  };
};

const MilkChart = () => {
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

    const { labels, amData, pmData, totalData, soldData } = buildMilkSeries(db);
    const colors = getThemeColors();

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'AM (Litres)',
            data: amData,
            borderColor: '#e08a2a',
            backgroundColor: 'rgba(224, 138, 42, 0.12)',
            fill: false,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2
          },
          {
            label: 'PM (Litres)',
            data: pmData,
            borderColor: '#3a6ac8',
            backgroundColor: 'rgba(58, 106, 200, 0.12)',
            fill: false,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2
          },
          {
            label: 'Total Produced (Litres)',
            data: totalData,
            borderColor: colors.green,
            backgroundColor: 'rgba(42, 122, 58, 0.15)',
            fill: true,
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 3
          },
          {
            label: 'Sold (Litres)',
            data: soldData,
            borderColor: colors.blue,
            backgroundColor: 'rgba(26, 90, 138, 0.12)',
            fill: false,
            borderDash: [5, 4],
            tension: 0.35,
            pointRadius: 3,
            pointHoverRadius: 6,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 200,
        animation: { duration: 500 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: {
              color: colors.text,
              font: { size: 12 },
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: colors.surface,
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
            padding: 12,
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: colors.muted,
              font: { size: 11 },
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 6
            },
            grid: {
              color: colors.border,
              drawBorder: false
            },
            title: { display: true, text: 'Date', color: colors.muted, font: { size: 11, weight: '500' } }
          },
          y: {
            ticks: {
              color: colors.muted,
              font: { size: 11 }
            },
            grid: {
              color: colors.border,
              drawBorder: false
            },
            beginAtZero: true,
            title: {
              display: true,
              text: 'Litres',
              color: colors.muted,
              font: { size: 12, weight: '500' }
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
    const { labels, amData, pmData, totalData, soldData } = buildMilkSeries(db);
    downloadChartPng((ctx, colors) => ({
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'AM (Litres)', data: amData, borderColor: '#e08a2a', tension: 0.3, pointRadius: 3, borderWidth: 2 },
          { label: 'PM (Litres)', data: pmData, borderColor: '#3a6ac8', tension: 0.3, pointRadius: 3, borderWidth: 2 },
          { label: 'Total Produced (Litres)', data: totalData, borderColor: colors.green, backgroundColor: 'rgba(42,122,58,0.15)', fill: true, tension: 0.3, pointRadius: 3, borderWidth: 3 },
          { label: 'Sold (Litres)', data: soldData, borderColor: colors.blue, borderDash: [5, 4], tension: 0.3, pointRadius: 3, borderWidth: 2 }
        ]
      },
      options: {
        plugins: { legend: { labels: { color: colors.text } } },
        scales: {
          x: { ticks: { color: colors.text }, grid: { color: colors.border }, title: { display: true, text: 'Date', color: colors.text } },
          y: { ticks: { color: colors.text }, grid: { color: colors.border }, beginAtZero: true, title: { display: true, text: 'Litres', color: colors.text } }
        }
      }
    }), { filename: 'milk-production-chart.png', title: 'Avexi Farm — Milk Production & Sales' });
  };

  if (!chartLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '350px',
        color: 'var(--text-muted)',
        fontSize: '14px'
      }}>
        Loading chart...
      </div>
    );
  }

  if (db.milkRecords.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">Overview</div>
        No milk data to display chart
      </div>
    );
  }

  return (
    <div className="chart-card">
      <ChartDownloadButton onClick={handleDownload} />
      <div className="chart-shell">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default MilkChart;