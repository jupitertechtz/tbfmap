import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { supabase } from '../../lib/supabase';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);

  useEffect(() => {
    // Handle Supabase auth callback from email link
    const handleAuthCallback = async () => {
      try {
        // Check if there's a hash in the URL (Supabase auth callback)
        if (window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.substring(1));
          const accessToken = hashParams.get('access_token');
          const type = hashParams.get('type');

          if (type === 'recovery' && accessToken) {
            // Exchange the token for a session
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: hashParams.get('refresh_token') || '',
            });

            if (error) {
              setError('Invalid or expired reset link. Please request a new password reset.');
              setIsValidatingToken(false);
              return;
            }

            // Clear the hash from URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        }

        // Check if we have a valid session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setError('Invalid or expired reset link. Please request a new password reset.');
          setIsValidatingToken(false);
          return;
        }

        setIsValidatingToken(false);
      } catch (err) {
        setError('Error validating reset link. Please try again.');
        setIsValidatingToken(false);
      }
    };

    handleAuthCallback();
  }, []);

  const validateForm = () => {
    setError(null);

    if (!password.trim()) {
      setError('Please enter a new password');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    // Check for at least one uppercase, one lowercase, and one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      setError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Update password using Supabase Auth
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw new Error(updateError.message || 'Failed to reset password. Please try again.');
      }

      setSuccess(true);

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          replace: true,
          state: { message: 'Password reset successfully! Please sign in with your new password.' }
        });
      }, 3000);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValidatingToken) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
          <p className="text-muted-foreground">Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl p-8 card-shadow">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={32} className="text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Password Reset Successful!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <Button
                variant="default"
                fullWidth
                onClick={() => navigate('/login', { replace: true })}
                iconName="LogIn"
                iconPosition="left"
              >
                Go to Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23000000%22%20fill-opacity%3D%220.02%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-40"></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
              <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
              </div>
            </div>
            <div className="text-left">
              <h1 className="text-lg font-bold text-foreground">TBF</h1>
              <p className="text-xs text-muted-foreground">Registration System</p>
            </div>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-xl p-8 card-shadow">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="Key" size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Reset Your Password
            </h2>
            <p className="text-muted-foreground">
              Enter your new password below.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} className="text-red-600" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                label="New Password"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Must be at least 8 characters with uppercase, lowercase, and a number
              </p>
            </div>

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="default"
              size="lg"
              fullWidth
              loading={isLoading}
              iconName="Check"
              iconPosition="left"
              disabled={isLoading}
            >
              {isLoading ? 'Resetting Password...' : 'Reset Password'}
            </Button>

            <div className="text-center">
              <Link
                to="/login"
                className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center space-x-1"
              >
                <Icon name="ArrowLeft" size={16} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground text-center">
              Need help?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80">
                Contact support
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Tanzania Basketball Federation. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

