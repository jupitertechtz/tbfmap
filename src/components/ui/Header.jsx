import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from './Button';
import Icon from '../AppIcon';

const Header = ({ title, subtitle, showBackButton = false, onBack, children }) => {
  const navigate = useNavigate();
  const { user, userProfile, signOut, loading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const { error } = await signOut();
      if (!error) {
        // Clear any local storage
        localStorage.removeItem('tbf_user');
        localStorage.removeItem('tbf_remember_me');
        
        // Navigate to login
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              iconName="ArrowLeft"
              iconPosition="left"
            >
              Back
            </Button>
          )}
          
          <div>
            {title && (
              <h1 className="text-xl font-semibold text-gray-900">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {children}
          
          {/* User Profile Section */}
          {user && (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                title="View Profile"
              >
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  {userProfile?.avatar_url ? (
                    <img
                      src={userProfile?.avatar_url}
                      alt={userProfile?.full_name || user?.email}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <Icon name="User" size={16} className="text-primary" />
                  )}
                </div>
                
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {userProfile?.full_name || user?.email?.split('@')?.[0]}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {userProfile?.role || 'User'}
                  </p>
                </div>
              </button>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                loading={isSigningOut}
                iconName="LogOut"
                iconPosition="left"
                disabled={isSigningOut || loading}
              >
                {isSigningOut ? 'Signing Out...' : 'Sign Out'}
              </Button>
            </div>
          )}
          
          {/* Show login button if not authenticated */}
          {!user && !loading && (
            <Button
              variant="default"
              size="sm"
              onClick={() => navigate('/login')}
              iconName="LogIn"
              iconPosition="left"
            >
              Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;