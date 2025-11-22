import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const NotificationPanel = ({ notifications }) => {
  const [filter, setFilter] = useState('all');

  const getNotificationIcon = (type) => {
    const iconMap = {
      critical: 'AlertTriangle',
      warning: 'AlertCircle',
      info: 'Info',
      success: 'CheckCircle',
    };
    return iconMap?.[type] || 'Bell';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      critical: 'text-error',
      warning: 'text-warning',
      info: 'text-accent',
      success: 'text-success',
    };
    return colorMap?.[type] || 'text-foreground';
  };

  const getNotificationBg = (type) => {
    const bgMap = {
      critical: 'bg-error/10',
      warning: 'bg-warning/10',
      info: 'bg-accent/10',
      success: 'bg-success/10',
    };
    return bgMap?.[type] || 'bg-muted/10';
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications?.filter(notif => notif?.type === filter);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 60) return `${minutes}m ago`;
    return `${hours}h ago`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Notifications</h3>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">{notifications?.filter(n => !n?.read)?.length} unread</span>
        </div>
      </div>
      <div className="flex space-x-2 mb-4">
        {['all', 'critical', 'warning', 'info']?.map((filterType) => (
          <Button
            key={filterType}
            variant={filter === filterType ? 'default' : 'ghost'}
            size="xs"
            onClick={() => setFilter(filterType)}
          >
            {filterType?.charAt(0)?.toUpperCase() + filterType?.slice(1)}
          </Button>
        ))}
      </div>
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredNotifications?.map((notification) => (
          <div 
            key={notification?.id} 
            className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors ${
              notification?.read ? 'border-border bg-muted/20' : 'border-primary/20 bg-primary/5'
            }`}
          >
            <div className={`w-8 h-8 rounded-full ${getNotificationBg(notification?.type)} flex items-center justify-center flex-shrink-0`}>
              <Icon name={getNotificationIcon(notification?.type)} size={16} className={getNotificationColor(notification?.type)} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <p className={`text-sm ${notification?.read ? 'text-muted-foreground' : 'text-foreground font-medium'}`}>
                  {notification?.title}
                </p>
                <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                  {formatTimeAgo(notification?.timestamp)}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{notification?.message}</p>
              
              {notification?.action && (
                <Button variant="ghost" size="xs" className="mt-2 p-0 h-auto text-primary">
                  {notification?.action}
                </Button>
              )}
            </div>
            
            {!notification?.read && (
              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2"></div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-border">
        <Button variant="ghost" size="sm" fullWidth iconName="Check">
          Mark All as Read
        </Button>
      </div>
    </div>
  );
};

export default NotificationPanel;