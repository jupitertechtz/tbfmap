import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Icon from '../../components/AppIcon';
import { useAuth } from '../../contexts/AuthContext';
import { sendInvitationEmail, sendProfileUpdateEmail } from '../../services/emailService';

const EmailConfigurationPage = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [apiStatus, setApiStatus] = useState('unknown'); // 'unknown', 'online', 'offline'
  const [isCheckingApi, setIsCheckingApi] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [testEmailForm, setTestEmailForm] = useState({
    recipient: '',
    emailType: 'invitation',
  });

  // Update recipient when userProfile loads
  useEffect(() => {
    if (userProfile?.email) {
      setTestEmailForm(prev => {
        if (!prev.recipient) {
          return { ...prev, recipient: userProfile.email };
        }
        return prev;
      });
    }
  }, [userProfile?.email]);
  const [banner, setBanner] = useState(null);
  const [emailConfig, setEmailConfig] = useState({
    email: 'tanzaniabasketball@gmail.com',
    // Always use Railway URL - ignore VITE_API_URL if it's set to old URL
    apiUrl: (import.meta.env.VITE_API_URL && !import.meta.env.VITE_API_URL.includes('api.tanzaniabasketball.com')) 
      ? import.meta.env.VITE_API_URL 
      : 'https://tbfmap-production.up.railway.app',
    status: 'configured',
  });

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin';

  // Redirect non-admin users
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAdmin) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [authLoading, isAdmin, navigate]);

  const breadcrumbItems = useMemo(
    () => [
      { label: 'Admin Dashboard', path: '/admin-dashboard' },
      { label: 'Email Configuration', path: '/email-configuration' },
    ],
    []
  );

  // Check API status on mount
  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    setIsCheckingApi(true);
    try {
      const apiUrl = emailConfig.apiUrl;
      const response = await fetch(`${apiUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setApiStatus('online');
      } else {
        setApiStatus('offline');
      }
    } catch (error) {
      setApiStatus('offline');
    } finally {
      setIsCheckingApi(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailForm.recipient) {
      setBanner({
        type: 'error',
        message: 'Please enter a recipient email address',
      });
      return;
    }

    setIsTestingEmail(true);
    setBanner(null);

    try {
      if (testEmailForm.emailType === 'invitation') {
        await sendInvitationEmail({
          to: testEmailForm.recipient,
          fullName: 'Test User',
          email: testEmailForm.recipient,
          password: 'TestPassword123!',
          role: 'staff',
          loginUrl: `${window.location.origin}/login`,
        });
        setBanner({
          type: 'success',
          message: `Test invitation email sent successfully to ${testEmailForm.recipient}`,
        });
      } else if (testEmailForm.emailType === 'profile_update') {
        await sendProfileUpdateEmail({
          to: testEmailForm.recipient,
          fullName: 'Test User',
          changes: {
            full_name: {
              old: 'Old Name',
              new: 'New Name',
            },
            phone: {
              old: '123456789',
              new: '987654321',
            },
          },
        });
        setBanner({
          type: 'success',
          message: `Test profile update email sent successfully to ${testEmailForm.recipient}`,
        });
      }
    } catch (error) {
      setBanner({
        type: 'error',
        message: error.message || 'Failed to send test email. Please check API status and configuration.',
      });
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied for unauthorized users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="ShieldAlert" size={48} className="text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/admin-dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} mt-16 p-6`}>
          <div className="max-w-6xl mx-auto space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            {/* Banner */}
            {banner && (
              <div
                className={`p-4 rounded-lg border ${
                  banner.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon
                      name={banner.type === 'success' ? 'CheckCircle' : 'AlertCircle'}
                      size={20}
                    />
                    <p>{banner.message}</p>
                  </div>
                  <button
                    onClick={() => setBanner(null)}
                    className="text-current opacity-70 hover:opacity-100"
                  >
                    <Icon name="X" size={18} />
                  </button>
                </div>
              </div>
            )}

            {/* Page Header */}
            <div>
              <h1 className="text-3xl font-bold text-foreground">Email Configuration</h1>
              <p className="text-muted-foreground mt-2">
                Manage email notifications, test email functionality, and view email templates.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Email Service Status */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2">
                      <Icon name="Mail" size={24} className="text-primary" />
                      <span>Email Service Status</span>
                    </h2>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={checkApiStatus}
                      loading={isCheckingApi}
                      iconName="RefreshCw"
                    >
                      Check Status
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            apiStatus === 'online'
                              ? 'bg-green-500'
                              : apiStatus === 'offline'
                              ? 'bg-red-500'
                              : 'bg-yellow-500'
                          }`}
                        />
                        <span className="font-medium text-foreground">
                          API Status: {apiStatus === 'online' ? 'Online' : apiStatus === 'offline' ? 'Offline' : 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Email Account</p>
                        <p className="font-medium text-foreground">{emailConfig.email}</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">API URL</p>
                        <p className="font-medium text-foreground break-all">{emailConfig.apiUrl}</p>
                      </div>
                    </div>

                    {apiStatus === 'offline' && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start space-x-2">
                          <Icon name="AlertTriangle" size={20} className="text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-800">API Server Offline</p>
                            <p className="text-sm text-yellow-700 mt-1">
                              The email API server is not responding. Please ensure the server is running on{' '}
                              <code className="bg-yellow-100 px-1 rounded">{emailConfig.apiUrl}</code>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Test Email */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2 mb-4">
                    <Icon name="Send" size={24} className="text-primary" />
                    <span>Test Email</span>
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Recipient Email
                      </label>
                      <Input
                        type="email"
                        value={testEmailForm.recipient}
                        onChange={(e) =>
                          setTestEmailForm({ ...testEmailForm, recipient: e.target.value })
                        }
                        placeholder="Enter recipient email address"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email Type
                      </label>
                      <select
                        value={testEmailForm.emailType}
                        onChange={(e) =>
                          setTestEmailForm({ ...testEmailForm, emailType: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="invitation">User Invitation</option>
                        <option value="profile_update">Profile Update Notification</option>
                      </select>
                    </div>

                    <Button
                      variant="default"
                      onClick={handleTestEmail}
                      loading={isTestingEmail}
                      iconName="Send"
                      iconPosition="left"
                      disabled={!testEmailForm.recipient || apiStatus === 'offline'}
                    >
                      {isTestingEmail ? 'Sending...' : 'Send Test Email'}
                    </Button>
                  </div>
                </div>

                {/* Email Templates */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <h2 className="text-xl font-semibold text-foreground flex items-center space-x-2 mb-4">
                    <Icon name="FileText" size={24} className="text-primary" />
                    <span>Email Templates</span>
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">User Invitation</h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sent when a new user is invited to the system. Includes account details and
                        temporary password.
                      </p>
                    </div>

                    <div className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-foreground">Profile Update Notification</h3>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          Active
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Sent when a user updates their profile information. Includes a summary of
                        changes and security notice.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Info */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Quick Info</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Configuration</p>
                      <p className="font-medium text-foreground">Gmail SMTP</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Port</p>
                      <p className="font-medium text-foreground">587 (TLS)</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Security</p>
                      <p className="font-medium text-foreground">TLS/STARTTLS</p>
                    </div>
                  </div>
                </div>

                {/* Notification Preferences */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Notification Types
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center space-x-2">
                        <Icon name="UserPlus" size={16} className="text-primary" />
                        <span className="text-sm text-foreground">User Invitations</span>
                      </div>
                      <Icon name="Check" size={16} className="text-green-500" />
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center space-x-2">
                        <Icon name="User" size={16} className="text-primary" />
                        <span className="text-sm text-foreground">Profile Updates</span>
                      </div>
                      <Icon name="Check" size={16} className="text-green-500" />
                    </div>
                  </div>
                </div>

                {/* Help & Support */}
                <div className="bg-card rounded-lg border border-border shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Help & Support</h3>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      For email configuration issues, ensure:
                    </p>
                    <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                      <li>API server is running</li>
                      <li>Gmail credentials are correct</li>
                      <li>2-Step Verification is enabled</li>
                      <li>App Password is configured</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmailConfigurationPage;

