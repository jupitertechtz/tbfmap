import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const GameEventLog = ({ events, onAddEvent, gameState }) => {
  const [showEventForm, setShowEventForm] = useState(false);
  const [eventType, setEventType] = useState('');

  const eventTypes = [
    { value: 'timeout', label: 'Timeout', icon: 'Clock', color: 'text-warning' },
    { value: 'technical', label: 'Technical Foul', icon: 'AlertTriangle', color: 'text-error' },
    { value: 'substitution', label: 'Substitution', icon: 'RefreshCw', color: 'text-accent' },
    { value: 'injury', label: 'Injury Timeout', icon: 'Heart', color: 'text-destructive' },
    { value: 'review', label: 'Official Review', icon: 'Eye', color: 'text-muted-foreground' },
  ];

  const formatEventTime = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEventIcon = (type) => {
    const eventType = eventTypes?.find(et => et?.value === type);
    return eventType ? eventType?.icon : 'Circle';
  };

  const getEventColor = (type) => {
    const eventType = eventTypes?.find(et => et?.value === type);
    return eventType ? eventType?.color : 'text-muted-foreground';
  };

  const handleAddEvent = (type) => {
    const newEvent = {
      id: Date.now(),
      type,
      timestamp: new Date()?.toISOString(),
      period: gameState?.period,
      timeRemaining: gameState?.timeRemaining,
      description: `${eventTypes?.find(et => et?.value === type)?.label} recorded`
    };
    onAddEvent(newEvent);
    setShowEventForm(false);
    setEventType('');
  };

  return (
    <div className="bg-card border border-border rounded-lg card-shadow">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="FileText" size={20} className="text-primary" />
            <h3 className="font-semibold text-foreground">Game Events</h3>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEventForm(!showEventForm)}
            iconName="Plus"
            iconPosition="left"
          >
            Add Event
          </Button>
        </div>
      </div>
      {/* Add Event Form */}
      {showEventForm && (
        <div className="p-4 border-b border-border bg-muted/30">
          <h4 className="text-sm font-medium text-foreground mb-3">Record Event</h4>
          <div className="grid grid-cols-2 gap-2">
            {eventTypes?.map((type) => (
              <Button
                key={type?.value}
                variant="outline"
                size="sm"
                onClick={() => handleAddEvent(type?.value)}
                iconName={type?.icon}
                iconPosition="left"
                className="justify-start"
              >
                {type?.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      {/* Events List */}
      <div className="p-4">
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events?.length === 0 ? (
            <div className="text-center py-8">
              <Icon name="FileText" size={48} className="text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No events recorded yet</p>
              <p className="text-sm text-muted-foreground">Game events will appear here as they occur</p>
            </div>
          ) : (
            events?.map((event, index) => (
              <div key={event?.id} className="flex items-start space-x-3 p-3 rounded-lg border border-border">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-muted ${getEventColor(event?.type)}`}>
                  <Icon name={getEventIcon(event?.type)} size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-foreground">{event?.description}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatEventTime(event?.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Period: {event?.period === 5 ? 'OT' : `Q${event?.period}`}</span>
                    <span>Time: {Math.floor(event?.timeRemaining / 60)}:{(event?.timeRemaining % 60)?.toString()?.padStart(2, '0')}</span>
                    {event?.player && <span>Player: {event?.player}</span>}
                    {event?.team && <span>Team: {event?.team}</span>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Game Summary */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-foreground">{events?.filter(e => e?.type === 'timeout')?.length}</div>
            <div className="text-xs text-muted-foreground">Timeouts</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{events?.filter(e => e?.type === 'technical')?.length}</div>
            <div className="text-xs text-muted-foreground">Technicals</div>
          </div>
          <div>
            <div className="text-lg font-bold text-foreground">{events?.filter(e => e?.type === 'substitution')?.length}</div>
            <div className="text-xs text-muted-foreground">Substitutions</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameEventLog;