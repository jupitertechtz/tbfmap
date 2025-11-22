import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = ({ activities }) => {
  const getActivityIcon = (type) => {
    const iconMap = {
      team_registration: 'Users',
      player_registration: 'User',
      match_result: 'Trophy',
      official_assignment: 'Shield',
      league_update: 'Settings',
      system_backup: 'Database',
      team_approval: 'CheckCircle',
      user_registration: 'UserPlus',
    };
    return iconMap?.[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colorMap = {
      team_registration: 'text-primary',
      player_registration: 'text-accent',
      match_result: 'text-warning',
      official_assignment: 'text-secondary',
      league_update: 'text-success',
      system_backup: 'text-muted-foreground',
      team_approval: 'text-success',
      user_registration: 'text-primary',
    };
    return colorMap?.[type] || 'text-foreground';
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
        <Icon name="Activity" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activities && activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity?.id} className="flex items-start space-x-3 p-3 rounded-md hover:bg-muted/50 transition-colors">
              <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center ${getActivityColor(activity?.type)}`}>
                <Icon name={getActivityIcon(activity?.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground">{activity?.description}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-muted-foreground">{activity?.user}</span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{formatTimeAgo(activity?.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="Activity" size={32} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;