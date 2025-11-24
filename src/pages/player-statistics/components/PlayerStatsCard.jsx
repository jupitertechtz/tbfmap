import React from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PlayerStatsCard = ({ player, onCompare, onImageClick, onNameClick, isSelected }) => {
  const {
    id,
    name,
    photo,
    photoAlt,
    team,
    position,
    jerseyNumber,
    stats,
    achievements
  } = player;

  const statItems = [
    { label: 'PPG', value: stats?.pointsPerGame, icon: 'Target' },
    { label: 'RPG', value: stats?.reboundsPerGame, icon: 'RotateCcw' },
    { label: 'APG', value: stats?.assistsPerGame, icon: 'Users' },
    { label: 'FG%', value: `${stats?.fieldGoalPercentage}%`, icon: 'Percent' }
  ];

  return (
    <div className={`bg-card rounded-lg border ${isSelected ? 'border-primary' : 'border-border'} p-6 card-shadow transition-all micro-interaction hover:shadow-lg`}>
      {/* Player Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div 
              className="w-16 h-16 rounded-full overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => onImageClick && onImageClick(photo, photoAlt || `Photo of ${name}`)}
            >
              <Image
                src={photo}
                alt={photoAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground">
              {jerseyNumber}
            </div>
          </div>
          
          <div>
            {onNameClick ? (
              <button
                onClick={() => onNameClick(player)}
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors text-left"
              >
                {name}
              </button>
            ) : (
              <Link 
                to={`/player-profile/${id}`}
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
              >
                {name}
              </Link>
            )}
            <p className="text-sm text-muted-foreground">{position} • {team?.name || 'No Team'}</p>
            <div className="flex items-center space-x-2 mt-1">
              {achievements?.map((achievement, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary"
                >
                  <Icon name="Award" size={12} className="mr-1" />
                  {achievement}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Button
          variant={isSelected ? "default" : "outline"}
          size="sm"
          onClick={() => onCompare(player)}
          iconName={isSelected ? "Check" : "Plus"}
          iconPosition="left"
        >
          {isSelected ? 'Selected' : 'Compare'}
        </Button>
      </div>
      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems?.map((stat, index) => (
          <div key={index} className="text-center p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-center mb-2">
              <Icon name={stat?.icon} size={16} className="text-primary" />
            </div>
            <p className="text-lg font-bold text-foreground">{stat?.value}</p>
            <p className="text-xs text-muted-foreground">{stat?.label}</p>
          </div>
        ))}
      </div>
      {/* Performance Indicators */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Efficiency Rating</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${Math.min(stats?.efficiency, 100)}%` }}
              />
            </div>
            <span className="font-medium text-foreground">{stats?.efficiency}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-muted-foreground">Games Played</span>
          <span className="font-medium text-foreground">{stats?.gamesPlayed}</span>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatsCard;