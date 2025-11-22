import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PlayerRoster = ({ 
  team, 
  players, 
  onPlayerAction, 
  onSubstitution, 
  isHomeTeam = true 
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showSubMenu, setShowSubMenu] = useState(null);

  const activePlayers = players?.filter(p => p?.isActive);
  const benchPlayers = players?.filter(p => !p?.isActive);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setShowSubMenu(player?.id);
  };

  const handleAction = (action, value = 1) => {
    if (selectedPlayer) {
      onPlayerAction(selectedPlayer?.id, action, value);
      setShowSubMenu(null);
      setSelectedPlayer(null);
    }
  };

  const StatButton = ({ icon, label, onClick, variant = "outline" }) => (
    <Button
      variant={variant}
      size="xs"
      onClick={onClick}
      iconName={icon}
      className="text-xs"
    >
      {label}
    </Button>
  );

  return (
    <div className="bg-card border border-border rounded-lg card-shadow">
      {/* Team Header */}
      <div className={`p-4 border-b border-border ${isHomeTeam ? 'bg-primary/5' : 'bg-secondary/5'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isHomeTeam ? 'bg-primary' : 'bg-secondary'
            }`}>
              <span className="text-white font-bold">{team?.name?.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{team?.name}</h3>
              <p className="text-sm text-muted-foreground">
                Score: {team?.score} • Fouls: {team?.teamFouls}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Timeouts</div>
            <div className="text-lg font-bold text-foreground">{team?.timeouts}</div>
          </div>
        </div>
      </div>
      {/* Active Players */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-foreground flex items-center">
            <Icon name="Users" size={16} className="mr-2" />
            On Court ({activePlayers?.length}/5)
          </h4>
        </div>
        
        <div className="space-y-2 mb-6">
          {activePlayers?.map((player) => (
            <div key={player?.id} className="relative">
              <div
                onClick={() => handlePlayerClick(player)}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors micro-interaction ${
                  selectedPlayer?.id === player?.id
                    ? 'border-primary bg-primary/5' :'border-border hover:bg-muted'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {player?.jerseyNumber}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{player?.name}</p>
                    <p className="text-xs text-muted-foreground">{player?.position}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-foreground">{player?.points} PTS</div>
                  <div className="text-xs text-muted-foreground">
                    {player?.rebounds}R • {player?.assists}A • {player?.fouls}F
                  </div>
                </div>
              </div>

              {/* Quick Actions Menu */}
              {showSubMenu === player?.id && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg dropdown-shadow z-10 p-2">
                  <div className="grid grid-cols-2 gap-1 mb-2">
                    <StatButton
                      icon="Target"
                      label="2PT"
                      onClick={() => handleAction('fieldGoal', 2)}
                      variant="success"
                    />
                    <StatButton
                      icon="Zap"
                      label="3PT"
                      onClick={() => handleAction('fieldGoal', 3)}
                      variant="success"
                    />
                    <StatButton
                      icon="Circle"
                      label="FT"
                      onClick={() => handleAction('freeThrow', 1)}
                      variant="success"
                    />
                    <StatButton
                      icon="RotateCcw"
                      label="REB"
                      onClick={() => handleAction('rebound')}
                    />
                    <StatButton
                      icon="ArrowRight"
                      label="AST"
                      onClick={() => handleAction('assist')}
                    />
                    <StatButton
                      icon="AlertTriangle"
                      label="FOUL"
                      onClick={() => handleAction('foul')}
                      variant="destructive"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() => onSubstitution(player?.id)}
                    iconName="RefreshCw"
                    fullWidth
                  >
                    Substitute
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bench Players */}
        <div className="border-t border-border pt-4">
          <h4 className="font-medium text-foreground flex items-center mb-3">
            <Icon name="Armchair" size={16} className="mr-2" />
            Bench ({benchPlayers?.length})
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            {benchPlayers?.map((player) => (
              <div
                key={player?.id}
                onClick={() => onSubstitution(player?.id)}
                className="flex items-center space-x-2 p-2 rounded border border-border hover:bg-muted cursor-pointer transition-colors micro-interaction"
              >
                <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center text-xs font-medium">
                  {player?.jerseyNumber}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{player?.name}</p>
                  <p className="text-xs text-muted-foreground">{player?.position}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerRoster;