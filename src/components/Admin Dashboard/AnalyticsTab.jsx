import React from 'react';
import { Bar, Pie } from 'react-chartjs-2';

const AnalyticsTab = ({ barData, pieData }) => {
  const hasValidBarData = barData && barData.labels && barData.datasets;
  const hasValidPieData = pieData && pieData.labels && pieData.datasets;

  return (
    <div className="analytics-section">
      <h1>Analytics</h1>

      <div className="chart-container">
        {hasValidBarData ? (
          <Bar data={barData} options={{ responsive: true }} />
        ) : (
          <p>No bar chart data available.</p>
        )}
      </div>

      <div className="chart-container">
        {hasValidPieData ? (
          <Pie data={pieData} options={{ responsive: true }} />
        ) : (
          <p>No pie chart data available.</p>
        )}
      </div>
    </div>
  );
};

export default AnalyticsTab;
