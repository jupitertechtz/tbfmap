import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ isCollapsed = false, onToggle }) => {
  const { userProfile } = useAuth();
  const userRole = userProfile?.role;
  const [expandedSections, setExpandedSections] = useState({
    registrations: true,
    management: true,
    operations: true,
    administration: true,
  });
  const location = useLocation();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const allNavigationSections = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'LayoutDashboard',
      items: [
        { label: 'Overview', path: '/admin-dashboard', icon: 'Home' },
      ],
      roles: ['admin', 'team_manager', 'staff', 'official', 'player'], // All roles can access
    },
    {
      id: 'registrations',
      label: 'Registrations',
      icon: 'UserPlus',
      items: [
        { label: 'Team Registration', path: '/team-registration', icon: 'Users' },
        { label: 'Player Registration', path: '/player-registration', icon: 'User' },
        { label: 'Official Registration', path: '/official-registration', icon: 'UserCheck' },
      ],
      roles: ['admin', 'team_manager', 'staff'], // Team managers can register
    },
    {
      id: 'management',
      label: 'League Management',
      icon: 'Trophy',
      items: [
        { label: 'Games Management', path: '/games-management', icon: 'Calendar', roles: ['admin', 'staff'] }, // Exclude team_manager
        { label: 'League Organizer', path: '/league-organizer', icon: 'Trophy', roles: ['admin', 'staff'] }, // Exclude team_manager
        { label: 'League Officials', path: '/league-officials', icon: 'UserCheck', roles: ['admin', 'staff'] },
        { label: 'Team Management', path: '/team-management', icon: 'ClipboardList' },
        { label: 'Team Profiles', path: '/team-profiles', icon: 'Shield' },
        { label: 'Players Profiles', path: '/players-profiles', icon: 'Users' },
        { label: 'Player Statistics', path: '/player-statistics', icon: 'BarChart3' },
      ],
      roles: ['admin', 'team_manager', 'staff'], // Team managers can manage teams (but not League Setup)
    },
    {
      id: 'operations',
      label: 'Match Operations',
      icon: 'Calendar',
      items: [
        { label: 'Match Management', path: '/match-management', icon: 'Clock' },
      ],
      roles: ['admin', 'staff', 'official'], // Exclude team_manager
    },
    {
      id: 'administration',
      label: 'Administration',
      icon: 'Shield',
      items: [
        { label: 'User Management', path: '/user-management', icon: 'Users' },
        { label: 'Email Configuration', path: '/email-configuration', icon: 'Mail' },
      ],
      roles: ['admin'], // Only admins
    }
  ];

  // Filter navigation sections based on user role
  const navigationSections = useMemo(() => {
    if (!userRole) return [];
    
    return allNavigationSections.filter(section => {
      return section.roles?.includes(userRole);
    });
  }, [userRole]);

  const isActiveSection = (section) => {
    return section?.items?.some(item => location?.pathname === item?.path);
  };

  const isActivePath = (path) => {
    return location?.pathname === path;
  };

  return (
    <aside className={`fixed left-0 top-16 bottom-0 z-40 bg-card border-r border-border transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } lg:translate-x-0`}>
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <h2 className="text-lg font-semibold text-foreground">Management</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            iconName={isCollapsed ? "ChevronRight" : "ChevronLeft"}
            className="text-muted-foreground hover:text-foreground"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          <div className="space-y-2">
            {navigationSections?.map((section) => (
              <div key={section?.id} className="space-y-1">
                {/* Section Header */}
                {section?.items?.length > 1 ? (
                  <button
                    onClick={() => !isCollapsed && toggleSection(section?.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors micro-interaction ${
                      isActiveSection(section)
                        ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    title={isCollapsed ? section?.label : ''}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon name={section?.icon} size={18} />
                      {!isCollapsed && <span>{section?.label}</span>}
                    </div>
                    {!isCollapsed && section?.items?.length > 1 && (
                      <Icon 
                        name="ChevronDown" 
                        size={16} 
                        className={`transition-transform ${
                          expandedSections?.[section?.id] ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>
                ) : (
                  // Single item sections (like Dashboard)
                  (<Link
                    to={section?.items?.[0]?.path}
                    className={`flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors micro-interaction ${
                      isActivePath(section?.items?.[0]?.path)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                    title={isCollapsed ? section?.label : ''}
                  >
                    <Icon name={section?.icon} size={18} />
                    {!isCollapsed && <span>{section?.label}</span>}
                  </Link>)
                )}

                {/* Section Items */}
                {section?.items?.length > 1 && (!isCollapsed && expandedSections?.[section?.id]) && (
                  <div className="ml-6 space-y-1">
                    {section?.items
                      ?.filter(item => {
                        // Filter items based on role if specified
                        if (item.roles) {
                          return item.roles.includes(userRole);
                        }
                        return true;
                      })
                      ?.map((item) => (
                        <Link
                          key={item?.path}
                          to={item?.path}
                          className={`flex items-center space-x-3 px-3 py-2 text-sm rounded-md transition-colors micro-interaction ${
                            isActivePath(item?.path)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                        >
                          <Icon name={item?.icon} size={16} />
                          <span>{item?.label}</span>
                        </Link>
                      ))}
                  </div>
                )}

                {/* Collapsed state items */}
                {isCollapsed && section?.items?.length > 1 && (
                  <div className="space-y-1">
                    {section?.items
                      ?.filter(item => {
                        // Filter items based on role if specified
                        if (item.roles) {
                          return item.roles.includes(userRole);
                        }
                        return true;
                      })
                      ?.map((item) => (
                        <Link
                          key={item?.path}
                          to={item?.path}
                          className={`flex items-center justify-center p-2 text-sm rounded-md transition-colors micro-interaction ${
                            isActivePath(item?.path)
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                          }`}
                          title={item?.label}
                        >
                          <Icon name={item?.icon} size={18} />
                        </Link>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-border">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="User" size={16} color="white" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {userProfile?.full_name || userProfile?.email || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {userRole ? userRole.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'TBF System'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;