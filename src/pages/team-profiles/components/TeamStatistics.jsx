import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';

const TeamStatistics = ({ statistics }) => {
  const performanceData = [
    { month: 'Oct', wins: 4, losses: 2 },
    { month: 'Nov', wins: 6, losses: 1 },
    { month: 'Dec', wins: 3, losses: 3 },
    { month: 'Jan', wins: 5, losses: 2 },
    { month: 'Feb', wins: 4, losses: 3 },
  ];

  const scoringData = [
    { game: 'Game 1', scored: 85, allowed: 78 },
    { game: 'Game 2', scored: 92, allowed: 88 },
    { game: 'Game 3', scored: 76, allowed: 82 },
    { game: 'Game 4', scored: 89, allowed: 75 },
    { game: 'Game 5', scored: 94, allowed: 87 },
  ];

  const shotDistribution = [
    { name: '2-Point', value: 45, color: '#1B5E20' },
    { name: '3-Point', value: 35, color: '#0277BD' },
    { name: 'Free Throw', value: 20, color: '#F57C00' },
  ];

  return (
    <div className="bg-card rounded-lg card-shadow p-6 mb-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">Team Statistics</h2>
      {/* Key Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-muted rounded-lg p-4 text-center">
          <Icon name="Target" size={24} className="text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{statistics?.fieldGoalPercentage}%</p>
          <p className="text-sm text-muted-foreground">Field Goal %</p>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <Icon name="Zap" size={24} className="text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{statistics?.threePointPercentage}%</p>
          <p className="text-sm text-muted-foreground">3-Point %</p>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <Icon name="RotateCcw" size={24} className="text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{statistics?.reboundsPerGame}</p>
          <p className="text-sm text-muted-foreground">Rebounds/Game</p>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <Icon name="Users" size={24} className="text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{statistics?.assistsPerGame}</p>
          <p className="text-sm text-muted-foreground">Assists/Game</p>
        </div>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Win/Loss Trend */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Performance</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-popover)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px'
                  }} 
                />
                <Bar dataKey="wins" fill="var(--color-success)" name="Wins" />
                <Bar dataKey="losses" fill="var(--color-error)" name="Losses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Scoring Trend */}
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Scoring</h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scoringData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="game" stroke="var(--color-muted-foreground)" />
                <YAxis stroke="var(--color-muted-foreground)" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--color-popover)', 
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px'
                  }} 
                />
                <Line type="monotone" dataKey="scored" stroke="var(--color-primary)" strokeWidth={2} name="Points Scored" />
                <Line type="monotone" dataKey="allowed" stroke="var(--color-error)" strokeWidth={2} name="Points Allowed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Shot Distribution */}
      <div className="bg-muted rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Shot Distribution</h3>
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
          <div className="w-full lg:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={shotDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {shotDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {shotDistribution?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: item?.color }}
                  />
                  <span className="text-foreground font-medium">{item?.name}</span>
                </div>
                <span className="text-foreground font-bold">{item?.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* League Rankings */}
      <div className="mt-6 bg-muted rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">League Rankings</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-primary">#{statistics?.offensiveRanking}</p>
            <p className="text-sm text-muted-foreground">Offensive Ranking</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-success">#{statistics?.defensiveRanking}</p>
            <p className="text-sm text-muted-foreground">Defensive Ranking</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-accent">#{statistics?.reboundRanking}</p>
            <p className="text-sm text-muted-foreground">Rebound Ranking</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-secondary">#{statistics?.overallRanking}</p>
            <p className="text-sm text-muted-foreground">Overall Ranking</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamStatistics;