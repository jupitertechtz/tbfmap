import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import Icon from '../../../components/AppIcon';

const TeamStatistics = ({ statistics }) => {
  if (!statistics) {
    return (
      <div className="bg-card rounded-lg card-shadow p-6">
        <h2 className="text-2xl font-bold text-foreground mb-4">Team Statistics</h2>
        <p className="text-muted-foreground">No statistics available for this team yet. Play some games to generate insights!</p>
      </div>
    );
  }

  const {
    gamesPlayed = 0,
    wins = 0,
    losses = 0,
    ties = 0,
    winPercentage = 0,
    pointsPerGame = 0,
    pointsAllowedPerGame = 0,
    pointDifference = 0,
    pointsFor = 0,
    pointsAgainst = 0,
    leaguePosition = null,
    performanceTrend = [],
    scoringTrend = [],
    homeRecord = { wins: 0, losses: 0 },
    awayRecord = { wins: 0, losses: 0 },
    recentMatches = [],
  } = statistics;

  const performanceData = performanceTrend?.length
    ? performanceTrend
    : [{ month: 'N/A', wins: 0, losses: 0 }];

  const scoringData = scoringTrend?.length
    ? scoringTrend
    : [{ game: 'N/A', scored: 0, allowed: 0 }];

  const pieData = [
    { name: 'Home Wins', value: homeRecord?.wins || 0, color: '#22c55e' },
    { name: 'Home Losses', value: homeRecord?.losses || 0, color: '#15803d' },
    { name: 'Away Wins', value: awayRecord?.wins || 0, color: '#0ea5e9' },
    { name: 'Away Losses', value: awayRecord?.losses || 0, color: '#0369a1' },
  ].filter((item) => item.value > 0);

  if (!pieData.length) {
    pieData.push({ name: 'No Games', value: 1, color: '#94a3b8' });
  }

  return (
    <div className="bg-card rounded-lg card-shadow p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Statistics</h2>
          {leaguePosition !== null && (
            <p className="text-sm text-muted-foreground">Current league position: #{leaguePosition}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-4xl font-bold text-primary">{Number(winPercentage).toFixed(1)}%</p>
          <p className="text-sm text-muted-foreground">Win Percentage</p>
        </div>
      </div>

      {/* Key Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-muted rounded-lg p-4 text-center">
          <Icon name="BarChart3" size={24} className="text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{gamesPlayed}</p>
          <p className="text-sm text-muted-foreground">Games Played</p>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <Icon name="CheckCircle" size={24} className="text-success mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">
            {wins}-{losses}{ties > 0 ? `-${ties}` : ''}
          </p>
          <p className="text-sm text-muted-foreground">Record (W-L-T)</p>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <Icon name="TrendingUp" size={24} className="text-accent mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{pointsPerGame}</p>
          <p className="text-sm text-muted-foreground">Points per Game</p>
        </div>
        <div className="bg-muted rounded-lg p-4 text-center">
          <Icon name="Shield" size={24} className="text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{pointsAllowedPerGame}</p>
          <p className="text-sm text-muted-foreground">Points Allowed</p>
        </div>
      </div>

      {/* Points Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Total Points Scored</h3>
          <p className="text-3xl font-bold text-primary">{pointsFor || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Across all games</p>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Total Points Allowed</h3>
          <p className="text-3xl font-bold text-secondary">{pointsAgainst || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Across all games</p>
        </div>
        <div className="bg-muted rounded-lg p-4">
          <h3 className="text-sm text-muted-foreground uppercase tracking-wide mb-2">Point Differential</h3>
          <p className={`text-3xl font-bold ${pointDifference >= 0 ? 'text-success' : 'text-destructive'}`}>
            {pointDifference >= 0 ? '+' : ''}
            {pointDifference}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {pointDifference >= 0 ? 'Positive' : 'Negative'} margin
          </p>
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
                <YAxis stroke="var(--color-muted-foreground)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
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
                <YAxis stroke="var(--color-muted-foreground)" allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-popover)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '6px',
                  }}
                />
                <Line type="monotone" dataKey="scored" stroke="var(--color-primary)" strokeWidth={2} name="Points Scored" />
                <Line type="monotone" dataKey="allowed" stroke="var(--color-error)" strokeWidth={2} name="Points Allowed" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Home / Away Distribution */}
      <div className="bg-muted rounded-lg p-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">Home vs Away Results</h3>
        <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
          <div className="w-full lg:w-1/2 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry?.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-3">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item?.color }} />
                  <span className="text-foreground font-medium">{item?.name}</span>
                </div>
                <span className="text-foreground font-bold">{item?.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Results */}
      {recentMatches?.length > 0 && (
        <div className="mt-6 bg-muted rounded-lg p-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Results</h3>
          <div className="space-y-3">
            {recentMatches.map((match) => (
              <div key={match?.id || match?.date} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-3">
                  <Icon
                    name={match?.result === 'Win' ? 'CheckCircle' : 'XCircle'}
                    size={16}
                    className={match?.result === 'Win' ? 'text-success' : 'text-destructive'}
                  />
                  <span className="text-foreground font-medium">{match?.date}</span>
                  <span className="text-muted-foreground">{match?.opponent}</span>
                </div>
                <div className="font-semibold text-foreground">{match?.score}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamStatistics;