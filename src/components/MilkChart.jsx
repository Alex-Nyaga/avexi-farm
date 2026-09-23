import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

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

    // Prepare data - group by date and separate AM/PM
    const milkByDate = {};
    db.milkRecords.forEach(record => {
      if (!milkByDate[record.date]) {
        milkByDate[record.date] = { am: 0, pm: 0 };
      }
      milkByDate[record.date].am += Number(record.am || 0);
      milkByDate[record.date].pm += Number(record.pm || 0);
    });

    const sortedDates = Object.keys(milkByDate).sort();
    const amData = sortedDates.map(date => milkByDate[date].am);
    const pmData = sortedDates.map(date => milkByDate[date].pm);
    const totalData = sortedDates.map(date => milkByDate[date].am + milkByDate[date].pm);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#e8f0ea' : '#111c17';
    const gridColor = isDark ? '#2a3d30' : '#d8e4db';

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: sortedDates,
        datasets: [
          {
            label: 'AM (Litres)',
            data: amData,
            borderColor: '#FFA500',
            backgroundColor: 'rgba(255, 165, 0, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
          },
          {
            label: 'PM (Litres)',
            data: pmData,
            borderColor: '#4169E1',
            backgroundColor: 'rgba(65, 105, 225, 0.1)',
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
          },
          {
            label: 'Total (Litres)',
            data: totalData,
            borderColor: '#2a7a3a',
            backgroundColor: 'rgba(42, 122, 58, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: textColor,
              font: {
                size: 12
              },
              padding: 15,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: isDark ? '#1a2a1e' : '#ffffff',
            titleColor: textColor,
            bodyColor: textColor,
            borderColor: gridColor,
            borderWidth: 1,
            padding: 12,
            mode: 'index',
            intersect: false
          }
        },
        scales: {
          x: {
            ticks: {
              color: textColor,
              font: {
                size: 11
              }
            },
            grid: {
              color: gridColor,
              drawBorder: false
            }
          },
          y: {
            ticks: {
              color: textColor,
              font: {
                size: 11
              }
            },
            grid: {
              color: gridColor,
              drawBorder: false
            },
            beginAtZero: true,
            title: {
              display: true,
              text: 'Litres',
              color: textColor,
              font: {
                size: 12,
                weight: '500'
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
        <div className="empty-icon">📊</div>
        No milk data to display chart
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative', 
      height: '350px', 
      width: '100%',
      padding: '10px'
    }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default MilkChart;