import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Image from '../../../components/AppImage';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { playerService } from '../../../services/playerService';

const LeaderboardSection = ({ onPlayerSelect, players = [] }) => {
  const [activeCategory, setActiveCategory] = useState('points');

  const categories = [
  { id: 'points', label: 'Points Per Game', icon: 'Target' },
  { id: 'rebounds', label: 'Rebounds Per Game', icon: 'RotateCcw' },
  { id: 'assists', label: 'Assists Per Game', icon: 'Users' },
  { id: 'steals', label: 'Steals Per Game', icon: 'Zap' },
  { id: 'blocks', label: 'Blocks Per Game', icon: 'Shield' },
  { id: 'efficiency', label: 'Efficiency Rating', icon: 'TrendingUp' }];

  // Generate leaderboard data from players
  const leaderboardData = React.useMemo(() => {
    if (!players || players.length === 0) {
      return {
        points: [],
        rebounds: [],
        assists: [],
        steals: [],
        blocks: [],
        efficiency: []
      };
    }

    // Sort players by category and take top 5
    const getTopPlayers = (category) => {
      const sorted = [...players].sort((a, b) => {
        let aValue = 0;
        let bValue = 0;
        
        switch (category) {
          case 'points':
            aValue = a?.stats?.pointsPerGame || 0;
            bValue = b?.stats?.pointsPerGame || 0;
            break;
          case 'rebounds':
            aValue = a?.stats?.reboundsPerGame || 0;
            bValue = b?.stats?.reboundsPerGame || 0;
            break;
          case 'assists':
            aValue = a?.stats?.assistsPerGame || 0;
            bValue = b?.stats?.assistsPerGame || 0;
            break;
          case 'steals':
            aValue = a?.stats?.stealsPerGame || 0;
            bValue = b?.stats?.stealsPerGame || 0;
            break;
          case 'blocks':
            aValue = a?.stats?.blocksPerGame || 0;
            bValue = b?.stats?.blocksPerGame || 0;
            break;
          case 'efficiency':
            aValue = a?.stats?.efficiency || 0;
            bValue = b?.stats?.efficiency || 0;
            break;
        }
        
        return bValue - aValue;
      });
      
      return sorted.slice(0, 5).map((player, index) => {
        let value = 0;
        switch (category) {
          case 'points':
            value = player?.stats?.pointsPerGame || 0;
            break;
          case 'rebounds':
            value = player?.stats?.reboundsPerGame || 0;
            break;
          case 'assists':
            value = player?.stats?.assistsPerGame || 0;
            break;
          case 'steals':
            value = player?.stats?.stealsPerGame || 0;
            break;
          case 'blocks':
            value = player?.stats?.blocksPerGame || 0;
            break;
          case 'efficiency':
            value = player?.stats?.efficiency || 0;
            break;
        }
        
        return {
          id: player?.id,
          rank: index + 1,
          name: player?.name || 'Unknown Player',
          photo: playerService.getPlayerPhotoUrl(player) || '/assets/images/no_image.png',
          photoAlt: player?.photoAlt || `Photo of ${player?.name || 'player'}`,
          team: player?.team?.name || 'Unknown Team',
          value: value,
          change: '+0.0' // Would need historical data to calculate
        };
      });
    };

    return {
      points: getTopPlayers('points'),
      rebounds: getTopPlayers('rebounds'),
      assists: getTopPlayers('assists'),
      steals: getTopPlayers('steals'),
      blocks: getTopPlayers('blocks'),
      efficiency: getTopPlayers('efficiency')
    };
  }, [players]);

  const getCurrentLeaderboard = () => {
    return leaderboardData?.[activeCategory] || leaderboardData?.points || [];
  };

  const getValueLabel = () => {
    const category = categories?.find((cat) => cat?.id === activeCategory);
    return category?.label || 'Points Per Game';
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Icon name="Crown" size={16} className="text-yellow-500" />;
      case 2:
        return <Icon name="Medal" size={16} className="text-gray-400" />;
      case 3:
        return <Icon name="Award" size={16} className="text-amber-600" />;
      default:
        return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border card-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">League Leaders</h3>
          <p className="text-sm text-muted-foreground">Top performers in key statistical categories</p>
        </div>
        <Link to="/player-statistics">
          <Button variant="outline" size="sm" iconName="ExternalLink" iconPosition="right">
            View All
          </Button>
        </Link>
      </div>
      {/* Category Tabs */}
      <div className="flex overflow-x-auto border-b border-border">
        {categories?.map((category) =>
        <button
          key={category?.id}
          onClick={() => setActiveCategory(category?.id)}
          className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
          activeCategory === category?.id ?
          'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`
          }>

            <Icon name={category?.icon} size={16} />
            <span className="hidden sm:inline">{category?.label}</span>
            <span className="sm:hidden">{category?.label?.split(' ')?.[0]}</span>
          </button>
        )}
      </div>
      {/* Leaderboard List */}
      <div className="p-6">
        <div className="space-y-4">
          {getCurrentLeaderboard()?.map((player) =>
          <div
            key={player?.id}
            className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors micro-interaction">

              <div className="flex items-center space-x-4">
                {/* Rank */}
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(player?.rank)}
                </div>

                {/* Player Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                    <Image
                    src={player?.photo}
                    alt={player?.photoAlt}
                    className="w-full h-full object-cover" />

                  </div>
                  <div>
                    <Link
                    to={`/player-profile/${player?.id}`}
                    className="text-sm font-semibold text-foreground hover:text-primary transition-colors">

                      {player?.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{player?.team}</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{player?.value}</p>
                  <p className="text-xs text-muted-foreground">{getValueLabel()}</p>
                </div>
                
                <div className={`flex items-center space-x-1 text-xs font-medium ${
              player?.change?.startsWith('+') ? 'text-success' : 'text-error'}`
              }>
                  <Icon
                  name={player?.change?.startsWith('+') ? 'TrendingUp' : 'TrendingDown'}
                  size={12} />

                  <span>{player?.change}</span>
                </div>

                <Button
                variant="ghost"
                size="sm"
                onClick={() => onPlayerSelect(player)}
                iconName="Plus"
                className="text-muted-foreground hover:text-foreground" />

              </div>
            </div>
          )}
        </div>

        {/* View More */}
        <div className="mt-6 text-center">
          <Link to="/player-statistics">
            <Button variant="outline" iconName="ArrowRight" iconPosition="right">
              View Complete Leaderboard
            </Button>
          </Link>
        </div>
      </div>
    </div>);

};

export default LeaderboardSection;