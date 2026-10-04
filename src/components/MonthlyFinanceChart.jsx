import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { getThemeColors } from '../utils/chartTheme';
import { downloadChartPng } from '../utils/chartExport';
import ChartDownloadButton from './ChartDownloadButton';

const buildSeries = (db) => {
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

  return {
    labels,
    incomeData: sortedMonths.map(monthKey => monthlyData[monthKey].income),
    expenseData: sortedMonths.map(monthKey => monthlyData[monthKey].expense),
    profitData: sortedMonths.map(monthKey => monthlyData[monthKey].income - monthlyData[monthKey].expense)
  };
};

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

    const { labels, incomeData, expenseData, profitData } = buildSeries(db);
    const colors = getThemeColors();

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Income',
            data: incomeData,
            backgroundColor: colors.green,
            borderRadius: 4,
            maxBarThickness: 34
          },
          {
            label: 'Expenses',
            data: expenseData,
            backgroundColor: colors.red,
            borderRadius: 4,
            maxBarThickness: 34
          },
          {
            label: 'Net Profit',
            data: profitData,
            backgroundColor: colors.blue,
            borderRadius: 4,
            maxBarThickness: 34
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 200,
        animation: false,
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
            title: { display: true, text: 'Month', color: colors.muted, font: { size: 11, weight: '500' } }
          },
          y: {
            ticks: {
              color: colors.muted,
              font: { size: 11 },
              callback: function(value) {
                return 'KES ' + value.toLocaleString();
              }
            },
            grid: {
              color: colors.border,
              drawBorder: false
            },
            beginAtZero: true,
            title: { display: true, text: 'Amount (KES)', color: colors.muted, font: { size: 12, weight: '500' } }
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

  const handleDownload = () => {
    const { labels, incomeData, expenseData, profitData } = buildSeries(db);
    downloadChartPng((ctx, colors) => ({
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Income', data: incomeData, backgroundColor: colors.green, borderRadius: 4, maxBarThickness: 34 },
          { label: 'Expenses', data: expenseData, backgroundColor: colors.red, borderRadius: 4, maxBarThickness: 34 },
          { label: 'Net Profit', data: profitData, backgroundColor: colors.blue, borderRadius: 4, maxBarThickness: 34 }
        ]
      },
      options: {
        plugins: { legend: { labels: { color: colors.text } } },
        scales: {
          x: { ticks: { color: colors.text }, grid: { color: colors.border }, title: { display: true, text: 'Month', color: colors.text } },
          y: { ticks: { color: colors.text }, grid: { color: colors.border }, beginAtZero: true, title: { display: true, text: 'Amount (KES)', color: colors.text } }
        }
      }
    }), { filename: 'monthly-finance-trend.png', title: 'Avexi Farm — Monthly Income, Expenses & Profit' });
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

  if (db.transactions.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">Overview</div>
        No financial data to display monthly trends
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

export default MonthlyFinanceChart;