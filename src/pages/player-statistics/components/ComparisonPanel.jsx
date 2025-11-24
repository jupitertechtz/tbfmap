import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import { playerService } from '../../../services/playerService';

const ComparisonPanel = ({ selectedPlayers, onRemovePlayer, onClearAll, onImageClick, onNameClick }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (selectedPlayers?.length === 0) {
    return (
      <div className="bg-card rounded-lg border border-border p-8 card-shadow text-center">
        <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No Players Selected</h3>
        <p className="text-muted-foreground">
          Select up to 4 players to compare their statistics side by side
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'BarChart3' },
    { id: 'shooting', label: 'Shooting', icon: 'Target' },
    { id: 'advanced', label: 'Advanced', icon: 'TrendingUp' }
  ];

  const getStatValue = (player, category, stat) => {
    if (category === 'overview') {
      return player?.stats?.[stat] || 0;
    }
    if (category === 'shooting') {
      return player?.shootingStats?.[stat] || 0;
    }
    if (category === 'advanced') {
      return player?.advancedStats?.[stat] || 0;
    }
    return 0;
  };

  const getStatCategories = () => {
    switch (activeTab) {
      case 'overview':
        return [
          { key: 'pointsPerGame', label: 'Points Per Game', format: 'decimal' },
          { key: 'reboundsPerGame', label: 'Rebounds Per Game', format: 'decimal' },
          { key: 'assistsPerGame', label: 'Assists Per Game', format: 'decimal' },
          { key: 'stealsPerGame', label: 'Steals Per Game', format: 'decimal' },
          { key: 'blocksPerGame', label: 'Blocks Per Game', format: 'decimal' },
          { key: 'fieldGoalPercentage', label: 'Field Goal %', format: 'percentage' }
        ];
      case 'shooting':
        return [
          { key: 'threePointPercentage', label: '3-Point %', format: 'percentage' },
          { key: 'freeThrowPercentage', label: 'Free Throw %', format: 'percentage' },
          { key: 'threePointsMade', label: '3-Pointers Made', format: 'decimal' },
          { key: 'freeThrowsMade', label: 'Free Throws Made', format: 'decimal' },
          { key: 'fieldGoalsMade', label: 'Field Goals Made', format: 'decimal' },
          { key: 'totalShots', label: 'Total Shots', format: 'integer' }
        ];
      case 'advanced':
        return [
          { key: 'efficiency', label: 'Efficiency Rating', format: 'decimal' },
          { key: 'plusMinus', label: 'Plus/Minus', format: 'signed' },
          { key: 'usageRate', label: 'Usage Rate %', format: 'percentage' },
          { key: 'trueShootingPercentage', label: 'True Shooting %', format: 'percentage' },
          { key: 'assistTurnoverRatio', label: 'Assist/TO Ratio', format: 'decimal' },
          { key: 'reboundRate', label: 'Rebound Rate %', format: 'percentage' }
        ];
      default:
        return [];
    }
  };

  const formatStatValue = (value, format) => {
    switch (format) {
      case 'percentage':
        return `${value}%`;
      case 'signed':
        return value > 0 ? `+${value}` : `${value}`;
      case 'decimal':
        return Number(value)?.toFixed(1);
      case 'integer':
        return Math.round(value);
      default:
        return value;
    }
  };

  const getBestPerformer = (stat, format) => {
    const values = selectedPlayers?.map(player => getStatValue(player, activeTab, stat));
    const maxValue = Math.max(...values);
    return values?.map(value => value === maxValue);
  };

  return (
    <div className="bg-card rounded-lg border border-border card-shadow">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Player Comparison</h3>
          <p className="text-sm text-muted-foreground">
            {selectedPlayers?.length} of 4 players selected
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          iconName="X"
          iconPosition="left"
        >
          Clear All
        </Button>
      </div>
      {/* Selected Players */}
      <div className="p-6 border-b border-border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {selectedPlayers?.map((player) => (
            <div key={player?.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <div 
                className="w-10 h-10 rounded-full overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onImageClick && onImageClick(
                  playerService.getPlayerPhotoUrl(player) || '/assets/images/no_image.png',
                  player?.photoAlt || `Photo of ${player?.name || 'player'}`
                )}
              >
                <Image
                  src={playerService.getPlayerPhotoUrl(player) || '/assets/images/no_image.png'}
                  alt={player?.photoAlt || `Photo of ${player?.name || 'player'}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                {onNameClick ? (
                  <button
                    onClick={() => onNameClick(player)}
                    className="text-sm font-medium text-foreground truncate hover:text-primary transition-colors text-left w-full"
                  >
                    {player?.name}
                  </button>
                ) : (
                  <p className="text-sm font-medium text-foreground truncate">{player?.name}</p>
                )}
                <p className="text-xs text-muted-foreground">{player?.team?.name || 'No Team'}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemovePlayer(player?.id)}
                iconName="X"
                className="text-muted-foreground hover:text-foreground"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Tabs */}
      <div className="flex border-b border-border">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab?.id
                ? 'border-b-2 border-primary text-primary' :'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab?.icon} size={16} />
            <span>{tab?.label}</span>
          </button>
        ))}
      </div>
      {/* Comparison Table */}
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 text-sm font-medium text-muted-foreground">Statistic</th>
                {selectedPlayers?.map((player) => (
                  <th key={player?.id} className="text-center py-3 text-sm font-medium text-muted-foreground">
                    {player?.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {getStatCategories()?.map((stat) => {
                const bestPerformers = getBestPerformer(stat?.key, stat?.format);
                return (
                  <tr key={stat?.key} className="border-b border-border">
                    <td className="py-3 text-sm font-medium text-foreground">{stat?.label}</td>
                    {selectedPlayers?.map((player, index) => {
                      const value = getStatValue(player, activeTab, stat?.key);
                      const isBest = bestPerformers?.[index];
                      return (
                        <td key={player?.id} className="text-center py-3">
                          <span className={`text-sm font-medium ${
                            isBest ? 'text-primary font-bold' : 'text-foreground'
                          }`}>
                            {formatStatValue(value, stat?.format)}
                          </span>
                          {isBest && (
                            <Icon name="Crown" size={12} className="text-primary ml-1 inline" />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPanel;