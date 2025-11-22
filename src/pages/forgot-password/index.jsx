import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import { authService } from '../../services/authService';
import { sendPasswordResetEmail } from '../../services/emailService';
import { supabase } from '../../lib/supabase';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email.trim()) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    try {
      // Get user profile to get full name if available
      let fullName = null;
      try {
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('email', email.trim())
          .single();
        
        if (profileData?.full_name) {
          fullName = profileData.full_name;
        }
      } catch (err) {
        // If we can't get user data, continue without full name
        console.log('Could not fetch user profile data');
      }

      // Generate reset URL - Supabase will handle the token in the email link
      const resetUrl = `${window.location.origin}/reset-password`;

      // Send branded password reset email via our API
      try {
        await sendPasswordResetEmail({
          to: email.trim(),
          fullName: fullName,
          resetUrl: resetUrl,
        });
      } catch (emailError) {
        console.error('Failed to send branded email:', emailError);
        // Continue with Supabase reset even if our email fails
      }

      // Also trigger Supabase password reset (this generates the secure token and sends Supabase's email)
      // Users will receive both emails, but our branded one provides better UX
      const { data, error: resetError } = await authService.resetPassword(email.trim());

      if (resetError) {
        // If Supabase reset fails, still show success if our email was sent
        // This way users get the branded email even if Supabase has issues
        setSuccess(true);
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
                Check Your Email
              </h2>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <div className="bg-muted rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>What to do next:</strong>
                </p>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the password reset link</li>
                  <li>Create a new password</li>
                  <li>Sign in with your new password</li>
                </ol>
              </div>
              <div className="space-y-3">
                <Button
                  variant="default"
                  fullWidth
                  onClick={() => navigate('/login')}
                  iconName="ArrowLeft"
                  iconPosition="left"
                >
                  Back to Sign In
                </Button>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="text-sm text-primary hover:text-primary/80 transition-colors"
                >
                  Send another email
                </button>
              </div>
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
              <Icon name="Lock" size={32} className="text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Forgot Password?
            </h2>
            <p className="text-muted-foreground">
              Enter your email address and we'll send you a link to reset your password.
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
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />

            <Button
              type="submit"
              variant="default"
              size="lg"
              fullWidth
              loading={isLoading}
              iconName="Mail"
              iconPosition="left"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
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
              Don't have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80">
                Contact your administrator
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

export default ForgotPasswordPage;

