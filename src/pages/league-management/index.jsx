import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import UserContextSwitcher from '../../components/ui/UserContextSwitcher';
import { useAuth } from '../../contexts/AuthContext';
import { leagueService } from '../../services/leagueService';
import { matchService } from '../../services/matchService';
import { officialService } from '../../services/officialService';

// Import components
import LeagueCard from './components/LeagueCard';
import FixtureGenerator from './components/FixtureGenerator';
import OfficialAssignment from './components/OfficialAssignment';
import LeagueStats from './components/LeagueStats';

const LeagueManagement = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [isFixtureGeneratorOpen, setIsFixtureGeneratorOpen] = useState(false);
  const [isOfficialAssignmentOpen, setIsOfficialAssignmentOpen] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  
  // Data states
  const [leagues, setLeagues] = useState([]);
  const [matches, setMatches] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user has access (admin or staff - but not team_manager)
  const userRole = userProfile?.role;
  const hasAccess = userRole === 'admin' || userRole === 'staff';

  // Redirect team managers and other unauthorized users
  useEffect(() => {
    if (authLoading) return;
    
    if (!hasAccess) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [authLoading, hasAccess, navigate]);

  // Load data on mount
  useEffect(() => {
    if (hasAccess) {
      loadData();
    }
  }, [hasAccess]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [leaguesData, matchesData, officialsData] = await Promise.all([
        leagueService.getAll(),
        matchService.getAll(),
        officialService.getAll()
      ]);
      setLeagues(leaguesData || []);
      setMatches(matchesData || []);
      setOfficials(officialsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
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
  if (!hasAccess) {
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

  // Transform leagues data for display
  const transformedLeagues = leagues.map(league => {
    const leagueMatches = matches.filter(m => m.leagueId === league.id);
    const completedMatches = leagueMatches.filter(m => m.matchStatus === 'completed').length;
    
    return {
      id: league.id,
      name: league.name,
      season: league.season,
      division: league.description || 'N/A',
      teamCount: league.currentTeams || 0,
      totalMatches: leagueMatches.length,
      completedMatches: completedMatches,
      status: league.leagueStatus || 'upcoming',
      format: league.description || 'N/A',
      startDate: league.startDate || '',
      endDate: league.endDate || '',
      recentMatches: leagueMatches
        .filter(m => m.matchStatus === 'completed')
        .slice(0, 3)
        .map(m => ({
          teams: `${m.homeTeam?.name || 'TBD'} vs ${m.awayTeam?.name || 'TBD'}`,
          score: `${m.homeScore || 0}-${m.awayScore || 0}`
        }))
    };
  });

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
    { value: 'draft', label: 'Draft' }
  ];

  const divisionOptions = [
    { value: 'all', label: 'All Divisions' },
    { value: 'premier', label: 'Premier Division' },
    { value: 'first', label: 'First Division' },
    { value: 'youth', label: 'Youth Division' },
    { value: 'women', label: 'Women\'s Division' },
    { value: 'regional', label: 'Regional' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard' },
    { id: 'leagues', label: 'Leagues', icon: 'Trophy' },
    { id: 'fixtures', label: 'Fixtures', icon: 'Calendar' },
    { id: 'officials', label: 'Officials', icon: 'Users' },
    { id: 'statistics', label: 'Statistics', icon: 'BarChart3' }
  ];

  const filteredLeagues = transformedLeagues?.filter(league => {
    const matchesSearch = league?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         league?.season?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || league?.status?.toLowerCase() === statusFilter;
    const matchesDivision = divisionFilter === 'all' || 
                           league?.division?.toLowerCase()?.includes(divisionFilter);
    
    return matchesSearch && matchesStatus && matchesDivision;
  });

  const handleCreateLeague = () => {
    navigate('/league-setup');
  };

  const handleEditLeague = (league) => {
    navigate(`/league-setup/${league?.id}`);
  };

  const handleDeleteLeague = (league) => {
    if (window.confirm(`Are you sure you want to delete ${league?.name}?`)) {
      console.log('Deleting league:', league);
    }
  };

  const handleViewFixtures = (league) => {
    console.log('Viewing fixtures for:', league);
    setSelectedLeague(league);
    setActiveTab('fixtures');
  };

  const handleManageTeams = (league) => {
    console.log('Managing teams for:', league);
    // Navigate to team management
  };

  const handleGenerateFixtures = (league) => {
    setSelectedLeague(league);
    setIsFixtureGeneratorOpen(true);
  };

  const handleAssignOfficials = () => {
    setIsOfficialAssignmentOpen(true);
  };

  const handleFixtureGeneration = (fixtures) => {
    console.log('Generated fixtures:', fixtures);
  };

  const handleOfficialAssignment = async (assignments) => {
    try {
      // Update matches with official assignments
      for (const assignment of assignments) {
        const { matchId, ...updateData } = assignment;
        await matchService.update(matchId, updateData);
      }
      
      // Reload data
      await loadData();
      
      // Show success message
      alert('Officials assigned successfully!');
    } catch (error) {
      console.error('Error assigning officials:', error);
      alert('Failed to assign officials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <main className={`pt-16 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="p-6">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <Breadcrumb />
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Trophy" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">League Management</h1>
                    <p className="text-muted-foreground">Create and manage basketball leagues</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <UserContextSwitcher />
              <Button
                variant="default"
                onClick={handleCreateLeague}
                iconName="Plus"
                iconPosition="left"
              >
                Create League
              </Button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-border mb-6">
            <nav className="flex space-x-8">
              {tabs?.map((tab) => (
                <button
                  key={tab?.id}
                  onClick={() => setActiveTab(tab?.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab?.id
                      ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground'
                  }`}
                >
                  <Icon name={tab?.icon} size={18} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" size={48} className="text-primary animate-spin" />
                </div>
              ) : error ? (
                <div className="px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
                  <p>{error}</p>
                </div>
              ) : (
                <LeagueStats stats={transformedLeagues} />
              )}
              
              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate('/league-setup')}
                  iconName="Plus"
                  iconPosition="left"
                  className="h-20 flex-col space-y-2"
                  fullWidth
                >
                  <span>Create League</span>
                  <span className="text-xs text-muted-foreground">Set up new competition</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('fixtures')}
                  iconName="Calendar"
                  iconPosition="left"
                  className="h-20 flex-col space-y-2"
                  fullWidth
                >
                  <span>Generate Fixtures</span>
                  <span className="text-xs text-muted-foreground">Create match schedule</span>
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleAssignOfficials}
                  iconName="Users"
                  iconPosition="left"
                  className="h-20 flex-col space-y-2"
                  fullWidth
                >
                  <span>Assign Officials</span>
                  <span className="text-xs text-muted-foreground">Manage referees</span>
                </Button>
                
                <Link to="/match-management">
                  <Button
                    variant="outline"
                    iconName="Play"
                    iconPosition="left"
                    className="h-20 flex-col space-y-2 w-full"
                    fullWidth
                  >
                    <span>Match Management</span>
                    <span className="text-xs text-muted-foreground">Manage games</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {activeTab === 'leagues' && (
            <div className="space-y-6">
              {/* Header with Setup Button */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Leagues</h2>
                <Button
                  variant="default"
                  onClick={() => navigate('/league-setup')}
                  iconName="Plus"
                  iconPosition="left"
                  size="default"
                >
                  Setup New League
                </Button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="search"
                    placeholder="Search leagues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e?.target?.value)}
                    className="w-full"
                  />
                </div>
                <Select
                  options={statusOptions}
                  value={statusFilter}
                  onChange={setStatusFilter}
                  placeholder="Filter by status"
                  className="w-48"
                />
                <Select
                  options={divisionOptions}
                  value={divisionFilter}
                  onChange={setDivisionFilter}
                  placeholder="Filter by division"
                  className="w-48"
                />
              </div>

              {/* League Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredLeagues?.map((league) => (
                  <LeagueCard
                    key={league?.id}
                    league={league}
                    onEdit={handleEditLeague}
                    onDelete={handleDeleteLeague}
                    onViewFixtures={handleViewFixtures}
                    onManageTeams={handleManageTeams}
                  />
                ))}
              </div>

              {filteredLeagues?.length === 0 && (
                <div className="text-center py-12">
                  <Icon name="Trophy" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No leagues found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || statusFilter !== 'all' || divisionFilter !== 'all' ?'Try adjusting your filters' :'Create your first league to get started'
                    }
                  </p>
                  <Button
                    variant="default"
                    onClick={() => navigate('/league-setup')}
                    iconName="Plus"
                    iconPosition="left"
                  >
                    Setup New League
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'fixtures' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Fixture Management</h2>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={handleAssignOfficials}
                    iconName="Users"
                    iconPosition="left"
                  >
                    Assign Officials
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => setIsFixtureGeneratorOpen(true)}
                    iconName="Zap"
                    iconPosition="left"
                  >
                    Generate Fixtures
                  </Button>
                </div>
              </div>

              {/* Fixture Generation Cards */}
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" size={48} className="text-primary animate-spin" />
                </div>
              ) : error ? (
                <div className="px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
                  <p>{error}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {transformedLeagues?.filter(league => league?.status === 'active' || league?.status === 'upcoming')?.map((league) => (
                  <div key={league?.id} className="bg-card border border-border rounded-lg p-6 card-shadow">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="Calendar" size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{league?.name}</h3>
                        <p className="text-sm text-muted-foreground">{league?.season}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Teams:</span>
                        <span className="text-foreground">{league?.teamCount}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Matches:</span>
                        <span className="text-foreground">{league?.totalMatches}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="text-foreground">{league?.status}</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => handleGenerateFixtures(league)}
                      iconName="Zap"
                      iconPosition="left"
                      fullWidth
                    >
                      Generate Fixtures
                    </Button>
                  </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'officials' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">Official Assignment</h2>
                <Button
                  variant="default"
                  onClick={handleAssignOfficials}
                  iconName="Users"
                  iconPosition="left"
                >
                  Assign Officials
                </Button>
              </div>

              <div className="bg-card border border-border rounded-lg p-6 card-shadow">
                <div className="text-center py-12">
                  <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Official Assignment</h3>
                  <p className="text-muted-foreground mb-4">
                    Assign referees and table officials to upcoming matches
                  </p>
                  <Button
                    variant="default"
                    onClick={handleAssignOfficials}
                    iconName="Users"
                    iconPosition="left"
                  >
                    Open Assignment Panel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'statistics' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-foreground">League Statistics</h2>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Icon name="Loader2" size={48} className="text-primary animate-spin" />
                </div>
              ) : error ? (
                <div className="px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
                  <p>{error}</p>
                </div>
              ) : (
                <LeagueStats stats={transformedLeagues} />
              )}
            </div>
          )}
        </div>
      </main>
      {/* Modals */}
      {isFixtureGeneratorOpen && selectedLeague && (
        <FixtureGenerator
          league={selectedLeague}
          onGenerate={handleFixtureGeneration}
          onClose={() => {
            setIsFixtureGeneratorOpen(false);
            setSelectedLeague(null);
          }}
        />
      )}
      <OfficialAssignment
        isOpen={isOfficialAssignmentOpen}
        matches={matches}
        officials={officials}
        onAssign={handleOfficialAssignment}
        onClose={() => setIsOfficialAssignmentOpen(false)}
      />
    </div>
  );
};

export default LeagueManagement;