import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { matchService } from '../../../services/matchService';

const MatchStatisticsPanel = ({ match, onClose }) => {
  const [matchStats, setMatchStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('team');

  useEffect(() => {
    if (match) {
      loadMatchStatistics();
    }
  }, [match]);

  const loadMatchStatistics = async () => {
    setIsLoading(true);
    try {
      // Fetch detailed match statistics
      // This would typically come from match events or a statistics endpoint
      // For now, we'll use mock data structure
      const stats = {
        home: {
          points: match.homeScore || 0,
          fieldGoalsMade: 0,
          fieldGoalsAttempted: 0,
          threePointersMade: 0,
          threePointersAttempted: 0,
          freeThrowsMade: 0,
          freeThrowsAttempted: 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          fouls: 0
        },
        away: {
          points: match.awayScore || 0,
          fieldGoalsMade: 0,
          fieldGoalsAttempted: 0,
          threePointersMade: 0,
          threePointersAttempted: 0,
          freeThrowsMade: 0,
          freeThrowsAttempted: 0,
          rebounds: 0,
          assists: 0,
          steals: 0,
          blocks: 0,
          turnovers: 0,
          fouls: 0
        }
      };
      
      setMatchStats(stats);
    } catch (err) {
      console.error('Error loading match statistics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'team', label: 'Team Stats', icon: 'BarChart3' },
    { id: 'shooting', label: 'Shooting', icon: 'Target' },
    { id: 'advanced', label: 'Advanced', icon: 'TrendingUp' },
  ];

  const calculatePercentage = (made, attempted) => {
    if (attempted === 0) return '0.0';
    return ((made / attempted) * 100).toFixed(1);
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

  const renderTeamStats = () => {
    if (!matchStats) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b-2 border-border">
          <div className="text-sm font-semibold text-muted-foreground w-1/3">Statistic</div>
          <div className="text-sm font-semibold text-foreground w-1/3 text-center">
            {match.homeTeam?.shortName || 'Home'}
          </div>
          <div className="text-sm font-semibold text-foreground w-1/3 text-center">
            {match.awayTeam?.shortName || 'Away'}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Basic Statistics</h4>
          <TeamStatRow 
            label="Points" 
            homeValue={matchStats.home.points} 
            awayValue={matchStats.away.points} 
          />
          <TeamStatRow 
            label="Field Goals" 
            homeValue={`${matchStats.home.fieldGoalsMade}/${matchStats.home.fieldGoalsAttempted}`} 
            awayValue={`${matchStats.away.fieldGoalsMade}/${matchStats.away.fieldGoalsAttempted}`} 
          />
          <TeamStatRow 
            label="3-Pointers" 
            homeValue={`${matchStats.home.threePointersMade}/${matchStats.home.threePointersAttempted}`} 
            awayValue={`${matchStats.away.threePointersMade}/${matchStats.away.threePointersAttempted}`} 
          />
          <TeamStatRow 
            label="Free Throws" 
            homeValue={`${matchStats.home.freeThrowsMade}/${matchStats.home.freeThrowsAttempted}`} 
            awayValue={`${matchStats.away.freeThrowsMade}/${matchStats.away.freeThrowsAttempted}`} 
          />
          <TeamStatRow 
            label="Rebounds" 
            homeValue={matchStats.home.rebounds} 
            awayValue={matchStats.away.rebounds} 
          />
          <TeamStatRow 
            label="Assists" 
            homeValue={matchStats.home.assists} 
            awayValue={matchStats.away.assists} 
          />
          <TeamStatRow 
            label="Steals" 
            homeValue={matchStats.home.steals} 
            awayValue={matchStats.away.steals} 
          />
          <TeamStatRow 
            label="Blocks" 
            homeValue={matchStats.home.blocks} 
            awayValue={matchStats.away.blocks} 
          />
          <TeamStatRow 
            label="Turnovers" 
            homeValue={matchStats.home.turnovers} 
            awayValue={matchStats.away.turnovers} 
          />
          <TeamStatRow 
            label="Fouls" 
            homeValue={matchStats.home.fouls} 
            awayValue={matchStats.away.fouls} 
          />
        </div>
      </div>
    );
  };

  const renderShootingStats = () => {
    if (!matchStats) return null;

    const homeFGPercent = calculatePercentage(matchStats.home.fieldGoalsMade, matchStats.home.fieldGoalsAttempted);
    const awayFGPercent = calculatePercentage(matchStats.away.fieldGoalsMade, matchStats.away.fieldGoalsAttempted);
    const home3PPercent = calculatePercentage(matchStats.home.threePointersMade, matchStats.home.threePointersAttempted);
    const away3PPercent = calculatePercentage(matchStats.away.threePointersMade, matchStats.away.threePointersAttempted);
    const homeFTPercent = calculatePercentage(matchStats.home.freeThrowsMade, matchStats.home.freeThrowsAttempted);
    const awayFTPercent = calculatePercentage(matchStats.away.freeThrowsMade, matchStats.away.freeThrowsAttempted);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b-2 border-border">
          <div className="text-sm font-semibold text-muted-foreground w-1/3">Shooting</div>
          <div className="text-sm font-semibold text-foreground w-1/3 text-center">
            {match.homeTeam?.shortName || 'Home'}
          </div>
          <div className="text-sm font-semibold text-foreground w-1/3 text-center">
            {match.awayTeam?.shortName || 'Away'}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-2">Shooting Percentages</h4>
          <TeamStatRow label="Field Goal %" homeValue={homeFGPercent} awayValue={awayFGPercent} isPercentage />
          <TeamStatRow label="3-Point %" homeValue={home3PPercent} awayValue={away3PPercent} isPercentage />
          <TeamStatRow label="Free Throw %" homeValue={homeFTPercent} awayValue={awayFTPercent} isPercentage />
        </div>
      </div>
    );
  };

  const renderAdvancedStats = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between py-2 border-b-2 border-border">
          <div className="text-sm font-semibold text-muted-foreground w-1/3">Advanced</div>
          <div className="text-sm font-semibold text-foreground w-1/3 text-center">
            {match.homeTeam?.shortName || 'Home'}
          </div>
          <div className="text-sm font-semibold text-foreground w-1/3 text-center">
            {match.awayTeam?.shortName || 'Away'}
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            Advanced statistics will be available once match events are recorded.
          </p>
        </div>
      </div>
    );
  };

  if (!match) return null;

  return (
    <div className="bg-card border border-border rounded-lg card-shadow">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-foreground">Match Statistics</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {match.homeTeam?.name || 'Home'} vs {match.awayTeam?.name || 'Away'}
            </p>
          </div>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <Icon name="X" size={16} />
            </Button>
          )}
        </div>
        
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              iconName={tab.icon}
              iconPosition="left"
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Icon name="Loader2" size={24} className="text-primary animate-spin" />
          </div>
        ) : (
          <>
            {activeTab === 'team' && renderTeamStats()}
            {activeTab === 'shooting' && renderShootingStats()}
            {activeTab === 'advanced' && renderAdvancedStats()}
          </>
        )}
      </div>
    </div>
  );
};

export default MatchStatisticsPanel;

