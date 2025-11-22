import React from 'react';
import Icon from '../../../components/AppIcon';

const LeagueStats = ({ stats }) => {
  const mockStats = {
    totalLeagues: 8,
    activeLeagues: 5,
    totalMatches: 156,
    completedMatches: 89,
    upcomingMatches: 67,
    totalTeams: 48,
    totalPlayers: 576,
    officialsAssigned: 24,
    venuesUsed: 12,
    averageAttendance: 1250,
    topScorer: {
      name: "James Mwangi",
      team: "Dar es Salaam Lions",
      points: 28.5
    },
    topTeam: {
      name: "Mwanza Warriors",
      wins: 12,
      losses: 2,
      winPercentage: 85.7
    }
  };

  const statCards = [
    {
      title: "Total Leagues",
      value: mockStats?.totalLeagues,
      icon: "Trophy",
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "+2 from last season"
    },
    {
      title: "Active Leagues",
      value: mockStats?.activeLeagues,
      icon: "Play",
      color: "text-success",
      bgColor: "bg-success/10",
      change: "Currently running"
    },
    {
      title: "Total Matches",
      value: mockStats?.totalMatches,
      icon: "Calendar",
      color: "text-accent",
      bgColor: "bg-accent/10",
      change: `${mockStats?.completedMatches} completed`
    },
    {
      title: "Upcoming Matches",
      value: mockStats?.upcomingMatches,
      icon: "Clock",
      color: "text-warning",
      bgColor: "bg-warning/10",
      change: "Next 30 days"
    },
    {
      title: "Total Teams",
      value: mockStats?.totalTeams,
      icon: "Users",
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      change: "Across all leagues"
    },
    {
      title: "Total Players",
      value: mockStats?.totalPlayers,
      icon: "User",
      color: "text-primary",
      bgColor: "bg-primary/10",
      change: "Registered players"
    },
    {
      title: "Officials Assigned",
      value: mockStats?.officialsAssigned,
      icon: "Shield",
      color: "text-accent",
      bgColor: "bg-accent/10",
      change: "Active officials"
    },
    {
      title: "Venues Used",
      value: mockStats?.venuesUsed,
      icon: "MapPin",
      color: "text-success",
      bgColor: "bg-success/10",
      change: "Across Tanzania"
    }
  ];

  const formatNumber = (num) => {
    if (num >= 1000) {
      return (num / 1000)?.toFixed(1) + 'K';
    }
    return num?.toString();
  };

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards?.map((stat, index) => (
          <div key={index} className="bg-card border border-border rounded-lg p-6 card-shadow hover:shadow-lg transition-all duration-200 micro-interaction">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat?.title}</p>
                <p className="text-2xl font-bold text-foreground mt-1">{formatNumber(stat?.value)}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat?.change}</p>
              </div>
              <div className={`w-12 h-12 ${stat?.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon name={stat?.icon} size={24} className={stat?.color} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Performance Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performer */}
        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Icon name="Star" size={20} className="text-warning" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Top Scorer</h3>
              <p className="text-sm text-muted-foreground">Current season leader</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{mockStats?.topScorer?.name}</p>
                <p className="text-sm text-muted-foreground">{mockStats?.topScorer?.team}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-warning">{mockStats?.topScorer?.points}</p>
                <p className="text-xs text-muted-foreground">PPG</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Team */}
        <div className="bg-card border border-border rounded-lg p-6 card-shadow">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Icon name="Award" size={20} className="text-success" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Top Team</h3>
              <p className="text-sm text-muted-foreground">Best win percentage</p>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{mockStats?.topTeam?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {mockStats?.topTeam?.wins}W - {mockStats?.topTeam?.losses}L
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-success">{mockStats?.topTeam?.winPercentage}%</p>
                <p className="text-xs text-muted-foreground">Win Rate</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Metrics */}
      <div className="bg-card border border-border rounded-lg p-6 card-shadow">
        <h3 className="text-lg font-semibold text-foreground mb-4">League Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Match Progress */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Match Progress</span>
              <span className="text-sm text-muted-foreground">
                {mockStats?.completedMatches}/{mockStats?.totalMatches}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary rounded-full h-2 transition-all duration-300"
                style={{ width: `${(mockStats?.completedMatches / mockStats?.totalMatches) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((mockStats?.completedMatches / mockStats?.totalMatches) * 100)}% Complete
            </p>
          </div>

          {/* Average Attendance */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Users" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Average Attendance</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{mockStats?.averageAttendance?.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Per match</p>
          </div>

          {/* Officials Utilization */}
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Shield" size={16} className="text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Officials Active</span>
            </div>
            <p className="text-2xl font-bold text-foreground">{mockStats?.officialsAssigned}</p>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeagueStats;