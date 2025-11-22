import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GameScoreboard = ({ 
  homeTeam, 
  awayTeam, 
  gameState, 
  onTimeoutHome, 
  onTimeoutAway, 
  onStartStop, 
  onPeriodChange 
}) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
      {/* Game Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Trophy" size={24} className="text-primary" />
          <div>
            <h2 className="text-lg font-semibold text-foreground">Live Match</h2>
            <p className="text-sm text-muted-foreground">{gameState?.venue} • {gameState?.date}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            gameState?.status === 'live' ?'bg-success/10 text-success' 
              : gameState?.status === 'halftime' ?'bg-warning/10 text-warning' :'bg-muted text-muted-foreground'
          }`}>
            {gameState?.status === 'live' && <Icon name="Circle" size={8} className="inline mr-1 fill-current" />}
            {gameState?.status?.toUpperCase()}
          </div>
        </div>
      </div>
      {/* Main Scoreboard */}
      <div className="grid grid-cols-3 gap-6 items-center mb-6">
        {/* Home Team */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{homeTeam?.name?.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{homeTeam?.name}</h3>
              <p className="text-sm text-muted-foreground">{homeTeam?.shortName}</p>
            </div>
          </div>
          <div className="text-5xl font-bold text-foreground mb-2">{homeTeam?.score}</div>
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTimeoutHome}
              disabled={homeTeam?.timeouts === 0}
              iconName="Clock"
              iconPosition="left"
            >
              Timeout ({homeTeam?.timeouts})
            </Button>
          </div>
        </div>

        {/* Game Clock & Period */}
        <div className="text-center">
          <div className="bg-muted rounded-lg p-4 mb-4">
            <div className="text-3xl font-bold text-foreground mb-1">
              {formatTime(gameState?.timeRemaining)}
            </div>
            <div className="text-sm text-muted-foreground">
              {gameState?.period === 5 ? 'OT' : `Q${gameState?.period}`}
            </div>
          </div>
          <div className="flex justify-center space-x-2">
            <Button
              variant={gameState?.status === 'live' ? 'destructive' : 'success'}
              size="sm"
              onClick={onStartStop}
              iconName={gameState?.status === 'live' ? 'Pause' : 'Play'}
              iconPosition="left"
            >
              {gameState?.status === 'live' ? 'Pause' : 'Start'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onPeriodChange}
              iconName="RotateCcw"
            >
              Next Period
            </Button>
          </div>
        </div>

        {/* Away Team */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{awayTeam?.name?.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{awayTeam?.name}</h3>
              <p className="text-sm text-muted-foreground">{awayTeam?.shortName}</p>
            </div>
          </div>
          <div className="text-5xl font-bold text-foreground mb-2">{awayTeam?.score}</div>
          <div className="flex justify-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onTimeoutAway}
              disabled={awayTeam?.timeouts === 0}
              iconName="Clock"
              iconPosition="left"
            >
              Timeout ({awayTeam?.timeouts})
            </Button>
          </div>
        </div>
      </div>
      {/* Quarter Scores */}
      <div className="bg-muted rounded-lg p-4">
        <div className="grid grid-cols-6 gap-4 text-center text-sm">
          <div className="font-medium text-muted-foreground">Team</div>
          <div className="font-medium text-muted-foreground">Q1</div>
          <div className="font-medium text-muted-foreground">Q2</div>
          <div className="font-medium text-muted-foreground">Q3</div>
          <div className="font-medium text-muted-foreground">Q4</div>
          <div className="font-medium text-muted-foreground">Total</div>
          
          <div className="font-medium text-foreground">{homeTeam?.shortName}</div>
          {homeTeam?.quarterScores?.map((score, index) => (
            <div key={index} className="text-foreground">{score}</div>
          ))}
          <div className="font-bold text-foreground">{homeTeam?.score}</div>
          
          <div className="font-medium text-foreground">{awayTeam?.shortName}</div>
          {awayTeam?.quarterScores?.map((score, index) => (
            <div key={index} className="text-foreground">{score}</div>
          ))}
          <div className="font-bold text-foreground">{awayTeam?.score}</div>
        </div>
      </div>
    </div>
  );
};

export default GameScoreboard;