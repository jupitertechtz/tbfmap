import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import MetricsCard from './components/MetricsCard';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import UpcomingFixtures from './components/UpcomingFixtures';
import RecentResults from './components/RecentResults';
import SystemHealth from './components/SystemHealth';
import NotificationPanel from './components/NotificationPanel';
import Icon from '../../components/AppIcon';
import { dashboardService } from '../../services/dashboardService';
import { useAuth } from '../../contexts/AuthContext';

const AdminDashboard = () => {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';
  
  const [metricsData, setMetricsData] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingActions, setPendingActions] = useState({
    teamApprovals: 0,
    playerTransfers: 0,
    officialAssignments: 0,
    leagueUpdates: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load all data for admin users
      // Non-admin users don't need metrics, activities, or pending actions
      if (isAdmin) {
        const [metrics, activities, pending] = await Promise.all([
          dashboardService.getMetrics(),
          dashboardService.getRecentActivities(15),
          dashboardService.getPendingActions(),
        ]);

        // Calculate changes for metrics
        const teamsChange = metrics.recentTeams > 0 ? `+${metrics.recentTeams}` : '0';
        const playersChange = metrics.recentPlayers > 0 ? `+${metrics.recentPlayers}` : '0';
        const officialsChange = metrics.recentOfficials > 0 ? `+${metrics.recentOfficials}` : '0';

        setMetricsData([
          {
            title: "Total Teams",
            value: metrics.totalTeams.toString(),
            change: teamsChange,
            changeType: metrics.recentTeams > 0 ? "positive" : "neutral",
            icon: "Users",
            trend: "vs last month"
          },
          {
            title: "Registered Players",
            value: metrics.totalPlayers.toString(),
            change: playersChange,
            changeType: metrics.recentPlayers > 0 ? "positive" : "neutral",
            icon: "User",
            trend: "vs last month"
          },
          {
            title: "Active Officials",
            value: metrics.totalOfficials.toString(),
            change: officialsChange,
            changeType: metrics.recentOfficials > 0 ? "positive" : "neutral",
            icon: "Shield",
            trend: "vs last month"
          },
          {
            title: "Running Leagues",
            value: metrics.activeLeagues.toString(),
            change: "0",
            changeType: "neutral",
            icon: "Trophy",
            trend: "current season"
          }
        ]);

        setRecentActivities(activities || []);
        setPendingActions(pending || {
          teamApprovals: 0,
          playerTransfers: 0,
          officialAssignments: 0,
          leagueUpdates: 0
        });
      } else {
        // Non-admin users: no metrics, activities, or pending actions
        setMetricsData([]);
        setRecentActivities([]);
        setPendingActions({
          teamApprovals: 0,
          playerTransfers: 0,
          officialAssignments: 0,
          leagueUpdates: 0
        });
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for upcoming fixtures
  const upcomingFixtures = [
    {
      id: 1,
      homeTeam: "Dodoma Lions",
      awayTeam: "Arusha Eagles",
      homeRecord: "12-3",
      awayRecord: "10-5",
      date: "2025-11-15T19:00:00",
      venue: "National Indoor Stadium",
      location: "Dar es Salaam"
    },
    {
      id: 2,
      homeTeam: "Mwanza Sharks",
      awayTeam: "Kilimanjaro Giants",
      homeRecord: "8-7",
      awayRecord: "11-4",
      date: "2025-11-16T16:30:00",
      venue: "Mwanza Sports Complex",
      location: "Mwanza"
    },
    {
      id: 3,
      homeTeam: "Zanzibar Waves",
      awayTeam: "Dar Warriors",
      homeRecord: "6-9",
      awayRecord: "9-6",
      date: "2025-11-17T18:00:00",
      venue: "Zanzibar Basketball Arena",
      location: "Zanzibar"
    }
  ];

  // Mock data for recent results
  const recentResults = [
    {
      id: 1,
      homeTeam: "Dodoma Lions",
      awayTeam: "Mwanza Sharks",
      homeScore: 78,
      awayScore: 65,
      date: "2025-11-10T19:00:00",
      league: "Premier League"
    },
    {
      id: 2,
      homeTeam: "Arusha Eagles",
      awayTeam: "Kilimanjaro Giants",
      homeScore: 82,
      awayScore: 89,
      date: "2025-11-09T16:30:00",
      league: "Premier League"
    },
    {
      id: 3,
      homeTeam: "Zanzibar Waves",
      awayTeam: "Dar Warriors",
      homeScore: 71,
      awayScore: 74,
      date: "2025-11-08T18:00:00",
      league: "Premier League"
    },
    {
      id: 4,
      homeTeam: "Tanga Thunder",
      awayTeam: "Morogoro Magic",
      homeScore: 95,
      awayScore: 88,
      date: "2025-11-07T19:30:00",
      league: "Division One"
    }
  ];

  // Mock data for system health
  const systemHealthData = [
    {
      id: 1,
      name: "Database Connection",
      description: "Primary database server",
      status: "healthy",
      lastCheck: "2 min ago"
    },
    {
      id: 2,
      name: "Backup System",
      description: "Automated backup service",
      status: "healthy",
      lastCheck: "5 min ago"
    },
    {
      id: 3,
      name: "File Storage",
      description: "Document and image storage",
      status: "warning",
      lastCheck: "1 min ago"
    },
    {
      id: 4,
      name: "Email Service",
      description: "Notification delivery system",
      status: "healthy",
      lastCheck: "3 min ago"
    },
    {
      id: 5,
      name: "API Gateway",
      description: "External service connections",
      status: "healthy",
      lastCheck: "1 min ago"
    }
  ];

  // Mock data for notifications
  const notifications = [
    {
      id: 1,
      type: "critical",
      title: "System Maintenance Required",
      message: "Database optimization scheduled for tonight at 2:00 AM",
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      read: false,
      action: "View Details"
    },
    {
      id: 2,
      type: "warning",
      title: "Storage Space Low",
      message: "File storage is at 85% capacity. Consider archiving old files.",
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      read: false,
      action: "Manage Storage"
    },
    {
      id: 3,
      type: "info",
      title: "New Feature Available",
      message: "Player statistics export feature is now available in the system.",
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      read: true,
      action: "Learn More"
    },
    {
      id: 4,
      type: "success",
      title: "Backup Completed",
      message: "Daily system backup completed successfully at 3:00 AM.",
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      read: true
    },
    {
      id: 5,
      type: "warning",
      title: "Pending Approvals",
      message: "3 team registrations are waiting for your approval.",
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      read: false,
      action: "Review Now"
    }
  ];

  const handleSidebarToggle = () => {
    // Sidebar toggle logic if needed
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 mt-16 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground">Loading dashboard data...</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar onToggle={handleSidebarToggle} />
        <main className="flex-1 ml-64 mt-16 p-6">
          <div className="max-w-7xl mx-auto">
            <Breadcrumb />
            
            {/* Page Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {isAdmin ? 'Admin Dashboard' : 'Dashboard'}
                  </h1>
                  <p className="text-muted-foreground">
                    {isAdmin 
                      ? "Welcome back! Here's what's happening with the TBF Registration System today."
                      : "Welcome back! Here's your dashboard overview."
                    }
                  </p>
                </div>
                <button
                  onClick={loadDashboardData}
                  className="flex items-center space-x-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                  title="Refresh data"
                >
                  <Icon name="RefreshCw" size={18} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="AlertCircle" size={20} className="text-red-600" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Metrics Cards - Admin Only */}
            {isAdmin && metricsData?.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {metricsData?.map((metric, index) => (
                  <MetricsCard
                    key={index}
                    title={metric?.title}
                    value={metric?.value}
                    change={metric?.change}
                    changeType={metric?.changeType}
                    icon={metric?.icon}
                    trend={metric?.trend}
                  />
                ))}
              </div>
            )}

            {/* Main Content Grid - Admin Only */}
            {isAdmin && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Left Column - Activity Feed */}
                <div className="lg:col-span-2">
                  <ActivityFeed activities={recentActivities} />
                </div>
                
                {/* Right Column - Notifications */}
                <div>
                  <NotificationPanel notifications={notifications} />
                </div>
              </div>
            )}

            {/* Quick Actions - Admin Only */}
            {isAdmin && (
              <div className="mb-8">
                <QuickActions pendingActions={pendingActions} />
              </div>
            )}

            {/* System Health - Admin Only */}
            {isAdmin && (
              <div className="mb-8">
                <SystemHealth healthData={systemHealthData} />
              </div>
            )}

            {/* Fixtures and Results - All Users */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <UpcomingFixtures fixtures={upcomingFixtures} />
              <RecentResults results={recentResults} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;