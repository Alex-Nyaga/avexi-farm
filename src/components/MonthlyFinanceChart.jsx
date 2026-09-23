import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';

const MonthlyFinanceChart = () => {
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

    // Prepare data - group by month
    const monthlyData = {};
    
    db.transactions.forEach(tx => {
      const date = new Date(tx.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expense: 0 };
      }
      
      if (tx.type === 'income') {
        monthlyData[monthKey].income += Number(tx.amount);
      } else {
        monthlyData[monthKey].expense += Number(tx.amount);
      }
    });

    const sortedMonths = Object.keys(monthlyData).sort();
    const labels = sortedMonths.map(monthKey => {
      const [year, monthNum] = monthKey.split('-');
      const date = new Date(year, monthNum - 1);
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });
    
    const incomeData = sortedMonths.map(monthKey => monthlyData[monthKey].income);
    const expenseData = sortedMonths.map(monthKey => monthlyData[monthKey].expense);
    const profitData = sortedMonths.map(monthKey => monthlyData[monthKey].income - monthlyData[monthKey].expense);

    const isDark = theme === 'dark';
    const textColor = isDark ? '#e8f0ea' : '#111c17';
    const gridColor = isDark ? '#2a3d30' : '#d8e4db';

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            borderColor: '#2a7a3a',
            backgroundColor: 'rgba(42, 122, 58, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
          },
          {
            label: 'Expenses',
            data: expenseData,
            borderColor: '#b03020',
            backgroundColor: 'rgba(176, 48, 32, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
          },
          {
            label: 'Net Profit',
            data: profitData,
            borderColor: '#3a7abf',
            backgroundColor: 'rgba(58, 122, 191, 0.15)',
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2
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
        No financial data to display monthly trends
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

export default MonthlyFinanceChart;