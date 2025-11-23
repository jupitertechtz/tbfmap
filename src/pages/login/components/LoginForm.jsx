import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const { signIn, loading, userProfile } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const roleOptions = [
    { value: 'admin', label: 'Administrator' },
    { value: 'team_manager', label: 'Team Manager' },
    { value: 'player', label: 'Player' },
    { value: 'official', label: 'Game Official' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors?.[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/?.test(formData?.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData?.password) {
      newErrors.password = 'Password is required';
    } else if (formData?.password?.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData?.role) {
      newErrors.role = 'Please select your role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const { data, error } = await signIn(formData?.email, formData?.password);
      
      if (error) {
        setErrors({
          general: error?.message || 'Login failed. Please check your credentials.'
        });
        return;
      }

      if (data?.user) {
        // Store remember me preference
        if (formData?.rememberMe) {
          localStorage.setItem('tbf_remember_me', 'true');
        } else {
          localStorage.removeItem('tbf_remember_me');
        }

        // Fetch the actual role from database (not from form selection)
        try {
          const { data: profileData, error: profileError } = await supabase
            ?.from('user_profiles')
            ?.select('role')
            ?.eq('id', data?.user?.id)
            ?.maybeSingle();

          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            // Default to admin dashboard if profile fetch fails
            navigate('/admin-dashboard', { replace: true });
            return;
          }

          // If no profile exists, default to admin dashboard
          if (!profileData) {
            navigate('/admin-dashboard', { replace: true });
            return;
          }

          // Navigate based on ACTUAL role from database, not form selection
          const roleRoutes = {
            'admin': '/admin-dashboard',
            'team_manager': '/team-registration',
            'player': '/player-registration',
            'official': '/match-management',
            'staff': '/admin-dashboard'
          };

          const actualRole = profileData?.role || 'admin';
          const targetRoute = roleRoutes?.[actualRole] || '/admin-dashboard';
          navigate(targetRoute, { replace: true });
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // Default to admin dashboard if profile fetch fails
          navigate('/admin-dashboard', { replace: true });
        }
      }
    } catch (error) {
      setErrors({
        general: 'Network error. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error Message */}
        {errors?.general && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <Icon name="AlertCircle" size={20} className="text-error mt-0.5" />
              <div>
                <p className="text-sm font-medium text-error">Authentication Failed</p>
                <p className="text-sm text-error/80 mt-1">{errors?.general}</p>
              </div>
            </div>
          </div>
        )}

        {/* Role Selection */}
        <Select
          label="Select Your Role"
          placeholder="Choose your access level"
          options={roleOptions}
          value={formData?.role}
          onChange={(value) => handleInputChange('role', value)}
          error={errors?.role}
          required
        />

        {/* Email Input */}
        <Input
          label="Email Address"
          type="email"
          placeholder="Enter your email address"
          value={formData?.email}
          onChange={(e) => handleInputChange('email', e?.target?.value)}
          error={errors?.email}
          required
        />

        {/* Password Input */}
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          value={formData?.password}
          onChange={(e) => handleInputChange('password', e?.target?.value)}
          error={errors?.password}
          required
        />

        {/* Remember Me Checkbox */}
        <Checkbox
          label="Remember me on this device"
          checked={formData?.rememberMe}
          onChange={(e) => handleInputChange('rememberMe', e?.target?.checked)}
        />

        {/* Login Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          fullWidth
          loading={isLoading || loading}
          iconName="LogIn"
          iconPosition="left"
          disabled={isLoading || loading}
        >
          {isLoading || loading ? 'Signing In...' : 'Sign In'}
        </Button>

        {/* Forgot Password Link */}
        <div className="text-center">
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Forgot your password?
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;