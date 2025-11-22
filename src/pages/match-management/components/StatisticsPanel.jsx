import React, { useState } from 'react';

import Button from '../../../components/ui/Button';

const StatisticsPanel = ({ homeTeam, awayTeam, gameStats }) => {
  const [activeTab, setActiveTab] = useState('team');

  const tabs = [
    { id: 'team', label: 'Team Stats', icon: 'BarChart3' },
    { id: 'shooting', label: 'Shooting', icon: 'Target' },
    { id: 'advanced', label: 'Advanced', icon: 'TrendingUp' },
  ];

  const calculatePercentage = (made, attempted) => {
    if (attempted === 0) return '0.0';
    return ((made / attempted) * 100)?.toFixed(1);
  };

  const TeamStatRow = ({ label, homeValue, awayValue, isPercentage = false }) => (
    <div className="flex items-center justify-between py-2 border-b border-border last:border-b-0">
      <div className="text-sm text-muted-foreground w-1/3">{label}</div>
      <div className="text-sm font-medium text-foreground w-1/3 text-center">
        {isPercentage ? `${homeValue}%` : homeValue}
      </div>
      <div className="text-sm font-medium text-foreground w-1/3 text-center">
        {isPercentage ? `${awayValue}%` : awayValue}
      </div>
    </div>
  );

  const renderTeamStats = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b-2 border-border">
        <div className="text-sm font-semibold text-muted-foreground w-1/3">Statistic</div>
        <div className="text-sm font-semibold text-foreground w-1/3 text-center">{homeTeam?.shortName}</div>
        <div className="text-sm font-semibold text-foreground w-1/3 text-center">{awayTeam?.shortName}</div>
      </div>

      {/* Basic Stats */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Basic Statistics</h4>
        <TeamStatRow label="Points" homeValue={gameStats?.home?.points} awayValue={gameStats?.away?.points} />
        <TeamStatRow label="Field Goals" homeValue={`${gameStats?.home?.fieldGoalsMade}/${gameStats?.home?.fieldGoalsAttempted}`} awayValue={`${gameStats?.away?.fieldGoalsMade}/${gameStats?.away?.fieldGoalsAttempted}`} />
        <TeamStatRow label="3-Pointers" homeValue={`${gameStats?.home?.threePointersMade}/${gameStats?.home?.threePointersAttempted}`} awayValue={`${gameStats?.away?.threePointersMade}/${gameStats?.away?.threePointersAttempted}`} />
        <TeamStatRow label="Free Throws" homeValue={`${gameStats?.home?.freeThrowsMade}/${gameStats?.home?.freeThrowsAttempted}`} awayValue={`${gameStats?.away?.freeThrowsMade}/${gameStats?.away?.freeThrowsAttempted}`} />
        <TeamStatRow label="Rebounds" homeValue={gameStats?.home?.totalRebounds} awayValue={gameStats?.away?.totalRebounds} />
        <TeamStatRow label="Assists" homeValue={gameStats?.home?.assists} awayValue={gameStats?.away?.assists} />
        <TeamStatRow label="Steals" homeValue={gameStats?.home?.steals} awayValue={gameStats?.away?.steals} />
        <TeamStatRow label="Blocks" homeValue={gameStats?.home?.blocks} awayValue={gameStats?.away?.blocks} />
        <TeamStatRow label="Turnovers" homeValue={gameStats?.home?.turnovers} awayValue={gameStats?.away?.turnovers} />
        <TeamStatRow label="Fouls" homeValue={gameStats?.home?.fouls} awayValue={gameStats?.away?.fouls} />
      </div>
    </div>
  );

  const renderShootingStats = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b-2 border-border">
        <div className="text-sm font-semibold text-muted-foreground w-1/3">Shooting</div>
        <div className="text-sm font-semibold text-foreground w-1/3 text-center">{homeTeam?.shortName}</div>
        <div className="text-sm font-semibold text-foreground w-1/3 text-center">{awayTeam?.shortName}</div>
      </div>

      {/* Shooting Percentages */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Shooting Percentages</h4>
        <TeamStatRow 
          label="Field Goal %" 
          homeValue={calculatePercentage(gameStats?.home?.fieldGoalsMade, gameStats?.home?.fieldGoalsAttempted)} 
          awayValue={calculatePercentage(gameStats?.away?.fieldGoalsMade, gameStats?.away?.fieldGoalsAttempted)} 
          isPercentage 
        />
        <TeamStatRow 
          label="3-Point %" 
          homeValue={calculatePercentage(gameStats?.home?.threePointersMade, gameStats?.home?.threePointersAttempted)} 
          awayValue={calculatePercentage(gameStats?.away?.threePointersMade, gameStats?.away?.threePointersAttempted)} 
          isPercentage 
        />
        <TeamStatRow 
          label="Free Throw %" 
          homeValue={calculatePercentage(gameStats?.home?.freeThrowsMade, gameStats?.home?.freeThrowsAttempted)} 
          awayValue={calculatePercentage(gameStats?.away?.freeThrowsMade, gameStats?.away?.freeThrowsAttempted)} 
          isPercentage 
        />
      </div>

      {/* Shot Chart */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Shot Distribution</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">2-Point Attempts</span>
            <div className="flex space-x-4">
              <span className="text-sm font-medium text-foreground">{gameStats?.home?.fieldGoalsAttempted - gameStats?.home?.threePointersAttempted}</span>
              <span className="text-sm font-medium text-foreground">{gameStats?.away?.fieldGoalsAttempted - gameStats?.away?.threePointersAttempted}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">3-Point Attempts</span>
            <div className="flex space-x-4">
              <span className="text-sm font-medium text-foreground">{gameStats?.home?.threePointersAttempted}</span>
              <span className="text-sm font-medium text-foreground">{gameStats?.away?.threePointersAttempted}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAdvancedStats = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b-2 border-border">
        <div className="text-sm font-semibold text-muted-foreground w-1/3">Advanced</div>
        <div className="text-sm font-semibold text-foreground w-1/3 text-center">{homeTeam?.shortName}</div>
        <div className="text-sm font-semibold text-foreground w-1/3 text-center">{awayTeam?.shortName}</div>
      </div>

      {/* Advanced Metrics */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-2">Efficiency Metrics</h4>
        <TeamStatRow label="Offensive Rating" homeValue="108.5" awayValue="102.3" />
        <TeamStatRow label="Defensive Rating" homeValue="95.2" awayValue="110.8" />
        <TeamStatRow label="Pace" homeValue="98.7" awayValue="101.2" />
        <TeamStatRow label="True Shooting %" homeValue="58.3" awayValue="52.1" isPercentage />
        <TeamStatRow label="Effective FG %" homeValue="55.2" awayValue="48.9" isPercentage />
        <TeamStatRow label="Turnover %" homeValue="12.8" awayValue="15.6" isPercentage />
        <TeamStatRow label="Rebound %" homeValue="52.3" awayValue="47.7" isPercentage />
      </div>

      {/* Performance Indicators */}
      <div className="bg-muted rounded-lg p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Performance Indicators</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-success">+12.5</div>
            <div className="text-xs text-muted-foreground">{homeTeam?.shortName} +/-</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-error">-12.5</div>
            <div className="text-xs text-muted-foreground">{awayTeam?.shortName} +/-</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-lg card-shadow">
      {/* Header with Tabs */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Game Statistics</h3>
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
        </div>
        
        <div className="flex space-x-1">
          {tabs?.map((tab) => (
            <Button
              key={tab?.id}
              variant={activeTab === tab?.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab?.id)}
              iconName={tab?.icon}
              iconPosition="left"
            >
              {tab?.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Content */}
      <div className="p-4">
        {activeTab === 'team' && renderTeamStats()}
        {activeTab === 'shooting' && renderShootingStats()}
        {activeTab === 'advanced' && renderAdvancedStats()}
      </div>
    </div>
  );
};

export default StatisticsPanel;