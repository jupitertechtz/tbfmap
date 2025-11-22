import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Breadcrumb = ({ items = [] }) => {
  const location = useLocation();

  // Default breadcrumb generation based on current path
  const generateDefaultBreadcrumbs = () => {
    if (!location || !location.pathname) return [];
    
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: 'Dashboard', path: '/admin-dashboard' }];

    const pathMap = {
      'team-registration': 'Team Registration',
      'player-registration': 'Player Registration',
      'league-management': 'League Management',
      'league-organizer': 'League Organizer',
      'league-setup': 'League Setup',
      'games-management': 'Games Management',
      'match-management': 'Match Management',
      'team-profiles': 'Team Profiles',
      'player-statistics': 'Player Statistics',
      'public-league-portal': 'League Portal',
    };

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = pathMap[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      
      if (segment !== 'admin-dashboard') {
        breadcrumbs.push({ label, path });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items?.length > 0 ? items : generateDefaultBreadcrumbs();

  // Don't show breadcrumbs on login or if only one item or no location
  if (!location || !location.pathname || location.pathname === '/login' || breadcrumbItems?.length <= 1) {
    return null;
  }

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          // Support both 'path' and 'href' properties for compatibility
          const itemPath = item?.path || item?.href;
          // Create a unique key - use path if available, otherwise use index and label
          const uniqueKey = itemPath || `${index}-${item?.label || 'item'}`;
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={uniqueKey} className="flex items-center space-x-2">
              {index > 0 && (
                <Icon name="ChevronRight" size={14} className="text-muted-foreground" />
              )}
              {isLast || !itemPath ? (
                <span className="font-medium text-foreground" aria-current={isLast ? "page" : undefined}>
                  {item?.label || 'Untitled'}
                </span>
              ) : (
                <Link
                  to={itemPath}
                  className="hover:text-foreground transition-colors micro-interaction"
                >
                  {item.label || 'Untitled'}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;