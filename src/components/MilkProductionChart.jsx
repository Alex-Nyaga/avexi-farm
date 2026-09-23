import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

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

    // Prepare data - milk by cow
    const milkByCow = {};
    db.milkRecords.forEach(record => {
      if (!milkByCow[record.cowTag]) {
        milkByCow[record.cowTag] = 0;
      }
      milkByCow[record.cowTag] += Number(record.am || 0) + Number(record.pm || 0);
    });

    const cowTags = Object.keys(milkByCow);
    const milkData = cowTags.map(tag => milkByCow[tag]);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#e8f0ea' : '#111c17';
    const gridColor = isDark ? '#2a3d30' : '#d8e4db';

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: cowTags,
        datasets: [{
          data: milkData,
          backgroundColor: [
            '#3a7abf',
            '#2a7a3a',
            '#bf8a3a',
            '#8a3abf',
            '#5aaf3a',
            '#b03020',
            '#4a8abf',
            '#d4960a'
          ],
          borderWidth: 2,
          borderColor: isDark ? '#162019' : '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: textColor,
              padding: 15,
              font: {
                size: 11
              }
            }
          },
          tooltip: {
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
        <div className="empty-icon">🥛</div>
        No milk data to display chart
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '250px', width: '100%' }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default MilkProductionChart;