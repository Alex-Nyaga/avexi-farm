import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

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

  useEffect(() => {
    if (!chartRef.current || !window.Chart || !chartLoaded) return;

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const labels = ['Cows', 'Sheep', 'Calves', 'Staff', 'Plots'];
    const data = [
      db.cows.filter(c => c.status === 'alive').length,
      db.sheep.filter(s => s.status === 'alive').length,
      db.calves.filter(c => c.status === 'alive').length,
      db.staff.filter(s => s.status === 'active').length,
      db.plotSeasons.filter(s => s.status === 'active').length
    ];

    const isDark = theme === 'dark';
    const primaryColor = isDark ? '#4a9a5a' : '#2a7a3a';
    const textColor = isDark ? '#c8d0c8' : '#3a4a3a';
    const gridColor = isDark ? '#2a3a2a' : '#e8f0e8';

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: primaryColor,
          borderRadius: 4,
          barThickness: 28
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: isDark ? '#1a2a1a' : '#ffffff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
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
              color: textColor,
              font: { size: 11, weight: '400' }
            },
            grid: { display: false }
          },
          y: {
            ticks: {
              color: textColor,
              font: { size: 10 },
              stepSize: 1,
              precision: 0
            },
            grid: {
              color: gridColor,
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
    <div style={{ position: 'relative', height: '200px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default DashboardCharts;