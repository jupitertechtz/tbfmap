import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const LeagueCard = ({ league, onEdit, onDelete, onViewFixtures, onManageTeams }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-success/10 text-success border-success/20';
      case 'Upcoming':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Completed':
        return 'bg-muted text-muted-foreground border-border';
      case 'Draft':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getProgressPercentage = () => {
    if (league?.totalMatches === 0) return 0;
    return Math.round((league?.completedMatches / league?.totalMatches) * 100);
  };

  return (
    <div className="bg-card border border-border rounded-lg card-shadow hover:shadow-lg transition-all duration-200 micro-interaction">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Trophy" size={24} className="text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{league?.name}</h3>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-muted-foreground">{league?.season}</span>
                <span className="text-sm text-muted-foreground">•</span>
                <span className="text-sm text-muted-foreground">{league?.division}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(league?.status)}`}>
              {league?.status}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              iconName={isExpanded ? "ChevronUp" : "ChevronDown"}
            />
          </div>
        </div>
      </div>
      {/* Stats Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{league?.teamCount}</div>
            <div className="text-xs text-muted-foreground">Teams</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{league?.totalMatches}</div>
            <div className="text-xs text-muted-foreground">Total Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{league?.completedMatches}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{getProgressPercentage()}%</div>
            <div className="text-xs text-muted-foreground">Progress</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Match Progress</span>
            <span>{league?.completedMatches}/{league?.totalMatches}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary rounded-full h-2 transition-all duration-300"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onViewFixtures(league)}
            iconName="Calendar"
            iconPosition="left"
          >
            Fixtures
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageTeams(league)}
            iconName="Users"
            iconPosition="left"
          >
            Teams
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(league)}
            iconName="Edit"
            iconPosition="left"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(league)}
            iconName="Trash2"
            iconPosition="left"
            className="text-error hover:text-error"
          >
            Delete
          </Button>
        </div>
      </div>
      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-border">
          <div className="pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">League Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span className="text-foreground">{league?.format}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Start Date:</span>
                    <span className="text-foreground">{league?.startDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">End Date:</span>
                    <span className="text-foreground">{league?.endDate}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {league?.recentMatches?.map((match, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      <span className="text-muted-foreground">{match?.teams}</span>
                      <span className="text-foreground font-medium">{match?.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeagueCard;