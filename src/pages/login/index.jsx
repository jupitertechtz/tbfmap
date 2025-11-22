import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Icon from '../../components/AppIcon';

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('tbf_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        const roleRoutes = {
          admin: '/admin-dashboard',
          'team-manager': '/team-registration',
          player: '/player-registration',
          official: '/match-management'
        };
        
        // Redirect to appropriate dashboard
        const redirectTo = roleRoutes[userData.role] || '/admin-dashboard';
        navigate(redirectTo, { replace: true });
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('tbf_user');
      }
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Image with White Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/assets/images/login-background.jpg)',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="w-full py-6 px-4 lg:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">TBF</h1>
                  <p className="text-xs text-muted-foreground">Registration System</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-sm font-medium text-foreground">Tanzania Basketball Federation</p>
                <p className="text-xs text-muted-foreground">Official Management Portal</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Centered Login Card */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-md">
            <div className="bg-card border border-border rounded-xl p-8 card-shadow">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4">
                  <Icon name="Trophy" size={32} color="white" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Sign In to Your Account
                </h2>
                <p className="text-muted-foreground">
                  Access your TBF dashboard and manage your basketball activities
                </p>
              </div>

              <LoginForm />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="w-full py-6 px-4 lg:px-6 border-t border-border bg-card/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="text-center sm:text-left">
                <p className="text-sm text-muted-foreground">
                  © {new Date().getFullYear()} Tanzania Basketball Federation. All rights reserved.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Powered by TBF Registration System v2.1
                </p>
              </div>
              
              <div className="flex items-center space-x-6 text-xs text-muted-foreground">
                <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-foreground transition-colors">Support</a>
                <a href="#" className="hover:text-foreground transition-colors">SSL Secured</a>
                <a href="#" className="hover:text-foreground transition-colors">Data Protected</a>
                <a href="#" className="hover:text-foreground transition-colors">Government Approved</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;