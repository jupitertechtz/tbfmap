import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';

const QuickActions = ({ pendingActions }) => {
  const { userProfile } = useAuth();
  const userRole = userProfile?.role;
  const isAdmin = userRole === 'admin';
  const isTeamManager = userRole === 'team_manager';

  const allActionItems = [
    {
      id: 'team_approvals',
      title: 'Pending Team Approvals',
      count: pendingActions?.teamApprovals,
      icon: 'Users',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      path: '/team-registration',
      description: 'Teams awaiting approval'
    },
    {
      id: 'player_transfers',
      title: 'Player Transfer Requests',
      count: pendingActions?.playerTransfers,
      icon: 'ArrowRightLeft',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      path: '/player-registration',
      description: 'Transfer requests pending'
    },
    {
      id: 'official_assignments',
      title: 'Official Assignments',
      count: pendingActions?.officialAssignments,
      icon: 'Shield',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      path: '/match-management',
      description: 'Matches need officials',
      roles: ['admin', 'staff', 'official'], // Exclude team_manager
    },
    {
      id: 'league_updates',
      title: 'League Updates Required',
      count: pendingActions?.leagueUpdates,
      icon: 'Trophy',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      path: '/league-management',
      description: 'Leagues need attention',
      roles: ['admin', 'staff'], // Exclude team_manager
    }
  ];

  // Filter action items based on user role
  const actionItems = useMemo(() => {
    if (!userRole) return [];
    
    return allActionItems.filter(item => {
      // If item has roles array, check if user role is included
      if (item.roles) {
        return item.roles.includes(userRole);
      }
      // If no roles specified, show to all
      return true;
    });
  }, [userRole]);

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <Icon name="Zap" size={20} className="text-muted-foreground" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {actionItems?.map((item) => (
          <Link
            key={item?.id}
            to={item?.path}
            className="block p-4 rounded-lg border border-border hover:border-primary/50 transition-colors micro-interaction"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-lg ${item?.bgColor} flex items-center justify-center`}>
                <Icon name={item?.icon} size={20} className={item?.color} />
              </div>
              <div className="text-right">
                <span className={`text-2xl font-bold ${item?.color}`}>{item?.count}</span>
              </div>
            </div>
            <h4 className="font-medium text-foreground mb-1">{item?.title}</h4>
            <p className="text-sm text-muted-foreground">{item?.description}</p>
          </Link>
        ))}
      </div>
      {isAdmin && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" iconName="FileText" iconPosition="left">
              Generate Reports
            </Button>
            <Button
              variant="outline"
              size="sm"
              iconName="Users"
              iconPosition="left"
              asChild
            >
              <Link to="/user-management">User Management</Link>
            </Button>
            <Button variant="outline" size="sm" iconName="Settings" iconPosition="left">
              System Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;