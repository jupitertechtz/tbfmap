import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const UserContextSwitcher = ({ 
  user = { 
    name: 'Administrator', 
    email: 'admin@tbf.co.tz', 
    role: 'admin',
    avatar: null 
  },
  onLogout 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      navigate('/login');
    }
  };

  const roleContexts = [
    {
      role: 'admin',
      label: 'Administrator',
      description: 'Full system access',
      path: '/admin-dashboard',
      icon: 'Shield',
    },
    {
      role: 'manager',
      label: 'Team Manager',
      description: 'Team management',
      path: '/team-registration',
      icon: 'Users',
    },
  ];

  const currentContext = roleContexts?.find(ctx => ctx?.role === user?.role) || roleContexts?.[0];

  const quickActions = [
    { label: 'Dashboard', path: '/admin-dashboard', icon: 'LayoutDashboard' },
    { label: 'Profile Settings', path: '/profile', icon: 'Settings' },
    { label: 'Help & Support', path: '/help', icon: 'HelpCircle' },
  ];

  // Don't show on login page
  if (location?.pathname === '/login') {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleDropdown}
        className="flex items-center space-x-2 h-10"
      >
        {/* User Avatar */}
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          {user?.avatar ? (
            <img 
              src={user?.avatar} 
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <Icon name="User" size={16} color="white" />
          )}
        </div>
        
        {/* User Info - Hidden on mobile */}
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-foreground leading-none">{user?.name}</p>
          <p className="text-xs text-muted-foreground leading-none mt-0.5">{currentContext?.label}</p>
        </div>
        
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>
      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute top-full right-0 mt-2 w-72 bg-popover border border-border rounded-lg dropdown-shadow z-50 animate-slide-down">
            {/* User Info Header */}
            <div className="px-4 py-3 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  {user?.avatar ? (
                    <img 
                      src={user?.avatar} 
                      alt={user?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={20} color="white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-popover-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Icon name={currentContext?.icon} size={12} className="text-primary" />
                    <span className="text-xs text-primary font-medium">{currentContext?.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Role Context Switcher */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Switch Context
              </p>
              <div className="space-y-1">
                {roleContexts?.map((context) => (
                  <button
                    key={context?.role}
                    onClick={() => {
                      setIsOpen(false);
                      navigate(context?.path);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      context?.role === user?.role
                        ? 'bg-primary/10 text-primary' :'text-popover-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon name={context?.icon} size={16} />
                    <div className="flex-1 text-left">
                      <p className="font-medium">{context?.label}</p>
                      <p className="text-xs text-muted-foreground">{context?.description}</p>
                    </div>
                    {context?.role === user?.role && (
                      <Icon name="Check" size={14} className="text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 border-b border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Quick Actions
              </p>
              <div className="space-y-1">
                {quickActions?.map((action) => (
                  <Link
                    key={action?.path}
                    to={action?.path}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-popover-foreground hover:bg-muted transition-colors"
                  >
                    <Icon name={action?.icon} size={16} />
                    <span>{action?.label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* System Actions */}
            <div className="px-4 py-3">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm text-error hover:bg-error/10 transition-colors"
              >
                <Icon name="LogOut" size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserContextSwitcher;