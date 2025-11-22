import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActions = ({ onAction, gameState }) => {
  const [showConfirm, setShowConfirm] = useState(null);

  const quickActions = [
    {
      id: 'endPeriod',
      label: 'End Period',
      icon: 'SkipForward',
      variant: 'outline',
      description: 'End current period and advance to next',
      confirmText: 'Are you sure you want to end the current period?'
    },
    {
      id: 'endGame',
      label: 'End Game',
      icon: 'Square',
      variant: 'destructive',
      description: 'Finalize game and submit results',
      confirmText: 'Are you sure you want to end the game? This action cannot be undone.'
    },
    {
      id: 'technicalFoul',
      label: 'Technical Foul',
      icon: 'AlertTriangle',
      variant: 'warning',
      description: 'Record technical foul',
      confirmText: 'Record a technical foul?'
    },
    {
      id: 'officialTimeout',
      label: 'Official Timeout',
      icon: 'Clock',
      variant: 'outline',
      description: 'Call official timeout',
      confirmText: 'Call an official timeout?'
    }
  ];

  const gameControls = [
    {
      id: 'resetClock',
      label: 'Reset Clock',
      icon: 'RotateCcw',
      variant: 'outline',
      description: 'Reset game clock to period start'
    },
    {
      id: 'adjustScore',
      label: 'Adjust Score',
      icon: 'Edit',
      variant: 'outline',
      description: 'Manual score adjustment'
    },
    {
      id: 'reviewPlay',
      label: 'Review Play',
      icon: 'Eye',
      variant: 'outline',
      description: 'Initiate official review'
    }
  ];

  const handleAction = (actionId) => {
    const action = [...quickActions, ...gameControls]?.find(a => a?.id === actionId);
    if (action?.confirmText) {
      setShowConfirm(actionId);
    } else {
      onAction(actionId);
    }
  };

  const confirmAction = (actionId) => {
    onAction(actionId);
    setShowConfirm(null);
  };

  return (
    <div className="bg-card border border-border rounded-lg card-shadow">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Zap" size={20} className="text-primary" />
          <h3 className="font-semibold text-foreground">Quick Actions</h3>
        </div>
      </div>
      {/* Game Status */}
      <div className="p-4 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Game Status</span>
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            gameState?.status === 'live' ?'bg-success/10 text-success' 
              : gameState?.status === 'halftime' ?'bg-warning/10 text-warning' :'bg-muted text-muted-foreground'
          }`}>
            {gameState?.status?.toUpperCase()}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Period:</span>
            <span className="ml-2 font-medium text-foreground">
              {gameState?.period === 5 ? 'OT' : `Q${gameState?.period}`}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Time:</span>
            <span className="ml-2 font-medium text-foreground">
              {Math.floor(gameState?.timeRemaining / 60)}:{(gameState?.timeRemaining % 60)?.toString()?.padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
      {/* Quick Actions */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-foreground mb-3">Game Actions</h4>
        <div className="space-y-2">
          {quickActions?.map((action) => (
            <Button
              key={action?.id}
              variant={action?.variant}
              size="sm"
              onClick={() => handleAction(action?.id)}
              iconName={action?.icon}
              iconPosition="left"
              fullWidth
              className="justify-start"
            >
              <div className="text-left">
                <div>{action?.label}</div>
                <div className="text-xs opacity-70">{action?.description}</div>
              </div>
            </Button>
          ))}
        </div>

        <h4 className="text-sm font-medium text-foreground mb-3 mt-6">Game Controls</h4>
        <div className="space-y-2">
          {gameControls?.map((control) => (
            <Button
              key={control?.id}
              variant={control?.variant}
              size="sm"
              onClick={() => handleAction(control?.id)}
              iconName={control?.icon}
              iconPosition="left"
              fullWidth
              className="justify-start"
            >
              <div className="text-left">
                <div>{control?.label}</div>
                <div className="text-xs opacity-70">{control?.description}</div>
              </div>
            </Button>
          ))}
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 modal-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-warning/10 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Confirm Action</h3>
                <p className="text-sm text-muted-foreground">
                  {quickActions?.find(a => a?.id === showConfirm)?.confirmText}
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowConfirm(null)}
                fullWidth
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => confirmAction(showConfirm)}
                fullWidth
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Keyboard Shortcuts */}
      <div className="p-4 border-t border-border bg-muted/30">
        <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          Keyboard Shortcuts
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Space</span>
            <span className="text-foreground">Start/Stop</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">T</span>
            <span className="text-foreground">Timeout</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">F</span>
            <span className="text-foreground">Foul</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">S</span>
            <span className="text-foreground">Substitute</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;