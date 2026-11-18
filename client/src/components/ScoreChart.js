import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ScoreChart = ({ teamA, teamB, teamASelected, teamBSelected }) => {
  const chartData = [
    {
      name: teamA?.name || 'Team A',
      selected: teamASelected,
      fill: '#3b82f6',
    },
    {
      name: teamB?.name || 'Team B',
      selected: teamBSelected,
      fill: '#ef4444',
    },
  ];

  return (
    <div className="score-chart">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="selected" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ScoreChart;
