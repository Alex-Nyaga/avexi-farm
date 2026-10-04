import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getThemeColors } from '../utils/chartTheme';
import { downloadChartPng } from '../utils/chartExport';
import ChartDownloadButton from './ChartDownloadButton';

const DashboardCharts = () => {
  const { db, theme } = useApp();
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [chartLoaded, setChartLoaded] = useState(false);

  useEffect(() => {
    if (window.Chart) {
      setChartLoaded(true);
    } else {
      const checkInterval = setInterval(() => {
        if (window.Chart) {
          setChartLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);
      return () => clearInterval(checkInterval);
    }
  }, []);

  const buildLabelsAndData = () => ({
    labels: ['Cows', 'Sheep', 'Calves', 'Staff', 'Plots'],
    data: [
      db.cows.filter(c => c.status === 'alive').length,
      db.sheep.filter(s => s.status === 'alive').length,
      db.calves.filter(c => c.status === 'alive').length,
      db.staff.filter(s => s.status === 'active').length,
      db.plotSeasons.filter(s => s.status === 'active').length
    ]
  });

  useEffect(() => {
    if (!chartRef.current || !window.Chart || !chartLoaded) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const { labels, data } = buildLabelsAndData();
    const colors = getThemeColors();

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: colors.green,
          maxBarThickness: 32,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 200,
        animation: { duration: 500 },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: colors.surface,
            titleColor: colors.text,
            bodyColor: colors.text,
            borderColor: colors.border,
            borderWidth: 1,
            padding: 8,
            displayColors: false,
            titleFont: { size: 11 },
            bodyFont: { size: 12, weight: '500' },
            callbacks: {
              label: (context) => `${context.label}: ${context.raw}`
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: colors.text,
              font: { size: 11, weight: '500' },
              maxRotation: 0,
              autoSkip: false
            },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: colors.muted,
              font: { size: 10 },
              stepSize: 1,
              precision: 0
            },
            grid: {
              color: colors.border,
              drawBorder: false
            },
            beginAtZero: true,
            max: Math.max(...data) + 1
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [db, theme, chartLoaded]);

  const handleDownload = () => {
    const { labels, data } = buildLabelsAndData();
    downloadChartPng((ctx, colors) => ({
      type: 'bar',
      data: {
        labels,
        datasets: [{ label: 'Count', data, backgroundColor: colors.green, borderRadius: 6, maxBarThickness: 40 }]
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          x: { ticks: { color: colors.text }, grid: { display: false }, title: { display: true, text: 'Farm assets', color: colors.text } },
          y: { ticks: { color: colors.text }, grid: { color: colors.border }, beginAtZero: true, title: { display: true, text: 'Count', color: colors.text } }
        }
      }
    }), { filename: 'farm-overview-chart.png', title: 'Avexi Farm — Farm Overview' });
  };

  if (!chartLoaded) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '200px',
        color: 'var(--text-muted)',
        fontSize: '13px'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div className="chart-card">
      <ChartDownloadButton onClick={handleDownload} />
      <div className="chart-shell chart-shell--compact">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default DashboardCharts;