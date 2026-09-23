import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const FinanceChart = () => {
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

    // Prepare data - group transactions by date
    const incomeByDate = {};
    const expenseByDate = {};
    
    db.transactions.forEach(tx => {
      if (!incomeByDate[tx.date]) incomeByDate[tx.date] = 0;
      if (!expenseByDate[tx.date]) expenseByDate[tx.date] = 0;
      
      if (tx.type === 'income') {
        incomeByDate[tx.date] += Number(tx.amount);
      } else {
        expenseByDate[tx.date] += Number(tx.amount);
      }
    });

    const allDates = [...new Set([...Object.keys(incomeByDate), ...Object.keys(expenseByDate)])].sort();
    const incomeData = allDates.map(date => incomeByDate[date] || 0);
    const expenseData = allDates.map(date => expenseByDate[date] || 0);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#e8f0ea' : '#111c17';
    const gridColor = isDark ? '#2a3d30' : '#d8e4db';

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: allDates,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: 'rgba(42, 122, 58, 0.7)',
            borderColor: '#2a7a3a',
            borderWidth: 2,
            borderRadius: 6
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: 'rgba(176, 48, 32, 0.7)',
            borderColor: '#b03020',
            borderWidth: 2,
            borderRadius: 6
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
            intersect: false,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: KES ${context.raw.toLocaleString()}`;
              }
            }
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
              },
              callback: function(value) {
                return 'KES ' + value.toLocaleString();
              }
            },
            grid: {
              color: gridColor,
              drawBorder: false
            },
            beginAtZero: true
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [db.transactions, theme, chartLoaded]);

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

  if (db.transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">Overview</div>
        No financial data to display chart
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

export default FinanceChart;