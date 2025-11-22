import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';

import Select from '../../../components/ui/Select';

const PerformanceChart = ({ selectedPlayer }) => {
  const [chartType, setChartType] = useState('line');
  const [timeRange, setTimeRange] = useState('season');
  const [statType, setStatType] = useState('points');

  const chartTypeOptions = [
    { value: 'line', label: 'Line Chart' },
    { value: 'bar', label: 'Bar Chart' }
  ];

  const timeRangeOptions = [
    { value: 'season', label: 'Current Season' },
    { value: 'last10', label: 'Last 10 Games' },
    { value: 'last5', label: 'Last 5 Games' },
    { value: 'career', label: 'Career Progression' }
  ];

  const statTypeOptions = [
    { value: 'points', label: 'Points' },
    { value: 'rebounds', label: 'Rebounds' },
    { value: 'assists', label: 'Assists' },
    { value: 'efficiency', label: 'Efficiency Rating' }
  ];

  // Mock performance data
  const performanceData = [
    { game: 'Game 1', date: '2024-10-15', opponent: 'Young Africans SC', points: 24, rebounds: 8, assists: 5, efficiency: 22.5 },
    { game: 'Game 2', date: '2024-10-18', opponent: 'Azam Basketball', points: 31, rebounds: 6, assists: 7, efficiency: 28.3 },
    { game: 'Game 3', date: '2024-10-22', opponent: 'Coastal Union', points: 18, rebounds: 12, assists: 4, efficiency: 19.8 },
    { game: 'Game 4', date: '2024-10-25', opponent: 'Mbeya City Ballers', points: 27, rebounds: 9, assists: 6, efficiency: 25.1 },
    { game: 'Game 5', date: '2024-10-29', opponent: 'Dodoma Basketball', points: 33, rebounds: 7, assists: 8, efficiency: 31.2 },
    { game: 'Game 6', date: '2024-11-02', opponent: 'Arusha Eagles', points: 22, rebounds: 11, assists: 3, efficiency: 21.7 },
    { game: 'Game 7', date: '2024-11-05', opponent: 'Kilimanjaro Stars', points: 29, rebounds: 5, assists: 9, efficiency: 27.8 },
    { game: 'Game 8', date: '2024-11-08', opponent: 'Tabora Warriors', points: 26, rebounds: 8, assists: 6, efficiency: 24.9 }
  ];

  const getFilteredData = () => {
    switch (timeRange) {
      case 'last5':
        return performanceData?.slice(-5);
      case 'last10':
        return performanceData?.slice(-10);
      case 'season':
      default:
        return performanceData;
    }
  };

  const getStatColor = () => {
    switch (statType) {
      case 'points':
        return '#1B5E20';
      case 'rebounds':
        return '#D84315';
      case 'assists':
        return '#0277BD';
      case 'efficiency':
        return '#F57C00';
      default:
        return '#1B5E20';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-popover-foreground">{data?.game}</p>
          <p className="text-sm text-muted-foreground">{data?.date}</p>
          <p className="text-sm text-muted-foreground">vs {data?.opponent}</p>
          <div className="mt-2 space-y-1">
            <p className="text-sm">
              <span className="font-medium" style={{ color: getStatColor() }}>
                {statTypeOptions?.find(opt => opt?.value === statType)?.label}: {payload?.[0]?.value}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (!selectedPlayer) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 card-shadow text-center">
        <Icon name="LineChart" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">Performance Analysis</h3>
        <p className="text-muted-foreground">
          Select a player to view detailed performance charts and trends
        </p>
      </div>
    );
  }

  const filteredData = getFilteredData();

  return (
    <div className="bg-card rounded-lg border border-border card-shadow">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-6 border-b border-border gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Performance Analysis</h3>
          <p className="text-sm text-muted-foreground">
            {selectedPlayer?.name} - {selectedPlayer?.team?.name || 'No Team'}
          </p>
        </div>

        {/* Chart Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <Select
            options={statTypeOptions}
            value={statType}
            onChange={setStatType}
            className="w-32"
          />
          <Select
            options={timeRangeOptions}
            value={timeRange}
            onChange={setTimeRange}
            className="w-36"
          />
          <Select
            options={chartTypeOptions}
            value={chartType}
            onChange={setChartType}
            className="w-32"
          />
        </div>
      </div>
      {/* Chart */}
      <div className="p-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'line' ? (
              <LineChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="game" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey={statType}
                  stroke={getStatColor()}
                  strokeWidth={3}
                  dot={{ fill: getStatColor(), strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: getStatColor(), strokeWidth: 2 }}
                />
              </LineChart>
            ) : (
              <BarChart data={filteredData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="game" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey={statType}
                  fill={getStatColor()}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Performance Summary */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              {(filteredData?.reduce((sum, game) => sum + game?.[statType], 0) / filteredData?.length)?.toFixed(1)}
            </p>
            <p className="text-sm text-muted-foreground">Average</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              {Math.max(...filteredData?.map(game => game?.[statType]))}
            </p>
            <p className="text-sm text-muted-foreground">Season High</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              {Math.min(...filteredData?.map(game => game?.[statType]))}
            </p>
            <p className="text-sm text-muted-foreground">Season Low</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <p className="text-2xl font-bold text-foreground">
              {filteredData?.length}
            </p>
            <p className="text-sm text-muted-foreground">Games</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;