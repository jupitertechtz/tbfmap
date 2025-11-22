import React, { useMemo, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import { playerService } from '../../../services/playerService';

const positionFilters = [
  { label: 'All', value: 'all' },
  { label: 'Point Guard', value: 'point_guard' },
  { label: 'Shooting Guard', value: 'shooting_guard' },
  { label: 'Small Forward', value: 'small_forward' },
  { label: 'Power Forward', value: 'power_forward' },
  { label: 'Center', value: 'center' },
];

const positionLabels = positionFilters.reduce((acc, pos) => {
  acc[pos.value] = pos.label;
  return acc;
}, {});

const statusStyles = {
  active: 'bg-success/10 text-success',
  injured: 'bg-warning/10 text-warning',
  suspended: 'bg-error/10 text-error',
  transferred: 'bg-muted-foreground/10 text-muted-foreground',
  inactive: 'bg-muted/50 text-muted-foreground',
};

const isNumericValue = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric);
};

const formatHeight = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  if (!isNumericValue(value)) {
    return typeof value === 'string' ? value : '-';
  }
  const cm = Number(value);
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm / 2.54) - (feet * 12));
  return `${feet}'${inches}" (${cm} cm)`;
};

const formatWeight = (value) => {
  if (value === null || value === undefined || value === '') return '-';
  if (!isNumericValue(value)) {
    return typeof value === 'string' ? value : '-';
  }
  const kg = Number(value);
  const lbs = Math.round(kg * 2.20462);
  return `${kg} kg • ${lbs} lbs`;
};

const formatStatus = (status) => {
  if (!status) return 'Unknown';
  return status.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
};

const getPlayerPhotoUrl = (player) => {
  // Use playerService helper method for consistent photo URL resolution
  return playerService.getPlayerPhotoUrl(player);
};

const TeamRoster = ({ players }) => {
  const [selectedPosition, setSelectedPosition] = useState('all');
  
  const normalizedPlayers = useMemo(() => {
    if (!players) return [];
    return players.map((player) => ({
      id: player?.id,
      name: player?.userProfile?.fullName || player?.name || 'Unknown Player',
      position: player?.playerPosition || player?.position || 'other',
      positionLabel: positionLabels[player?.playerPosition] || player?.position || 'Flex',
      jerseyNumber: player?.jerseyNumber,
      heightCm: player?.heightCm || player?.height,
      weightKg: player?.weightKg || player?.weight,
      photoUrl: getPlayerPhotoUrl(player),
      status: player?.playerStatus || player?.status || 'active',
      stats: player?.stats || player?.statistics || {},
    }));
  }, [players]);
  
  const filteredPlayers = useMemo(() => {
    if (selectedPosition === 'all') return normalizedPlayers;
    return normalizedPlayers.filter((player) => player.position === selectedPosition);
  }, [normalizedPlayers, selectedPosition]);

  return (
    <div className="bg-card rounded-lg card-shadow p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-4 sm:mb-0">Team Roster</h2>
        
        {/* Position Filter */}
        <div className="flex flex-wrap gap-2">
          {positionFilters?.map((position) => (
            <Button
              key={position.value}
              variant={selectedPosition === position.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPosition(position.value)}
              className="text-xs"
            >
              {position.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Roster Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredPlayers?.map((player) => (
          <div key={player?.id} className="bg-muted rounded-lg p-4 micro-interaction hover:shadow-lg transition-all border border-border/40">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border border-border flex items-center justify-center bg-background">
                <Image
                  src={player.photoUrl}
                  alt={player?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">
                    {player?.name}
                  </h3>
                  {player?.jerseyNumber && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-background border border-border text-muted-foreground">
                      #{player.jerseyNumber}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{player?.positionLabel}</p>
              </div>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-2">
                <Icon name="Ruler" size={12} className="text-muted-foreground" />
                <span>{formatHeight(player?.heightCm)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Weight" size={12} className="text-muted-foreground" />
                <span>{formatWeight(player?.weightKg)}</span>
              </div>
            </div>

            {/* Player Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-foreground">{player?.stats?.ppg ?? '-'}</p>
                <p className="text-xs text-muted-foreground">PPG</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{player?.stats?.rpg ?? '-'}</p>
                <p className="text-xs text-muted-foreground">RPG</p>
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{player?.stats?.apg ?? '-'}</p>
                <p className="text-xs text-muted-foreground">APG</p>
              </div>
            </div>

            {/* Player Status */}
            <div className="mt-3">
              <span className={`text-xs px-2 py-1 rounded-full ${
                statusStyles[player?.status] || 'bg-muted-foreground/10 text-muted-foreground'
              }`}>
                {formatStatus(player?.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
      {filteredPlayers?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No players found for the selected position.</p>
        </div>
      )}
    </div>
  );
};

export default TeamRoster;