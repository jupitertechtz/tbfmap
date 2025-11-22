import React from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';

const MatchResultCard = ({ match, onViewDetails }) => {
  const {
    id,
    scheduledDate,
    homeTeam,
    awayTeam,
    homeScore,
    awayScore,
    matchStatus,
    venue,
    league
  } = match;

  const isCompleted = matchStatus === 'completed';
  const isLive = matchStatus === 'live';
  const isScheduled = matchStatus === 'scheduled';

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch {
      return '-';
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return '-';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-success/10 text-success';
      case 'live':
        return 'bg-error/10 text-error';
      case 'scheduled':
        return 'bg-primary/10 text-primary';
      case 'postponed':
        return 'bg-warning/10 text-warning';
      case 'cancelled':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow hover:shadow-lg transition-all micro-interaction">
      {/* Match Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {league && (
            <>
              <span className="text-sm text-muted-foreground">{league.name}</span>
              {league.season && (
                <>
                  <Icon name="Circle" size={4} className="text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{league.season}</span>
                </>
              )}
            </>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(matchStatus)}`}>
          {isLive && <span className="inline-block w-2 h-2 bg-error rounded-full mr-1 animate-pulse" />}
          {matchStatus || 'scheduled'}
        </span>
      </div>

      {/* Match Content */}
      <div className="space-y-4">
        {/* Teams and Score */}
        <div className="flex items-center justify-between">
          {/* Home Team */}
          <div className="flex items-center space-x-3 flex-1">
            {homeTeam?.logoUrl ? (
              <Image
                src={homeTeam.logoUrl}
                alt={homeTeam.name}
                className="w-12 h-12 rounded object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                <Icon name="Shield" size={20} className="text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">
                {homeTeam?.name || homeTeam?.shortName || 'TBD'}
              </p>
              {homeTeam?.shortName && homeTeam?.name && (
                <p className="text-xs text-muted-foreground truncate">{homeTeam.shortName}</p>
              )}
            </div>
            {isCompleted && (
              <div className="text-2xl font-bold text-foreground">
                {homeScore ?? 0}
              </div>
            )}
            {isLive && (
              <div className="text-2xl font-bold text-error">
                {homeScore ?? 0}
              </div>
            )}
          </div>

          {/* VS or Score Separator */}
          <div className="mx-4">
            {isScheduled ? (
              <span className="text-muted-foreground">vs</span>
            ) : (
              <span className="text-muted-foreground">-</span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center space-x-3 flex-1 justify-end">
            {isCompleted && (
              <div className="text-2xl font-bold text-foreground">
                {awayScore ?? 0}
              </div>
            )}
            {isLive && (
              <div className="text-2xl font-bold text-error">
                {awayScore ?? 0}
              </div>
            )}
            <div className="flex-1 min-w-0 text-right">
              <p className="font-semibold text-foreground truncate">
                {awayTeam?.name || awayTeam?.shortName || 'TBD'}
              </p>
              {awayTeam?.shortName && awayTeam?.name && (
                <p className="text-xs text-muted-foreground truncate">{awayTeam.shortName}</p>
              )}
            </div>
            {awayTeam?.logoUrl ? (
              <Image
                src={awayTeam.logoUrl}
                alt={awayTeam.name}
                className="w-12 h-12 rounded object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                <Icon name="Shield" size={20} className="text-muted-foreground" />
              </div>
            )}
          </div>
        </div>

        {/* Match Details */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Icon name="Calendar" size={14} />
              <span>{formatDate(scheduledDate)}</span>
            </div>
            {scheduledDate && (
              <div className="flex items-center space-x-1">
                <Icon name="Clock" size={14} />
                <span>{formatTime(scheduledDate)}</span>
              </div>
            )}
            {venue && (
              <div className="flex items-center space-x-1">
                <Icon name="MapPin" size={14} />
                <span className="truncate max-w-[150px]">{venue}</span>
              </div>
            )}
          </div>
          {onViewDetails && (
            <button
              onClick={() => onViewDetails(match)}
              className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center space-x-1"
            >
              <span>View Details</span>
              <Icon name="ChevronRight" size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchResultCard;

