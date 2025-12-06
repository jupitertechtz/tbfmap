import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import { leagueService } from '../../services/leagueService';
import { matchService } from '../../services/matchService';
import { teamService } from '../../services/teamService';
import Image from '../../components/AppImage';
import { exportFixturesToPDF, exportFixturesToExcel, exportFixturesToWord } from '../../utils/fixtureExportUtils';
import KnockoutBracket from './components/KnockoutBracket';

const LeagueOrganizer = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  // Data states
  const [leagues, setLeagues] = useState([]);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [leagueDetails, setLeagueDetails] = useState(null);
  const [leagueFixtures, setLeagueFixtures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Fixture generation states
  const [isFixtureModalOpen, setIsFixtureModalOpen] = useState(false);
  const [fixtureSettings, setFixtureSettings] = useState({
    startDate: '',
    endDate: '',
    matchDays: [],
    timeSlots: ['14:00', '16:00', '18:00'],
    venues: [],
    restDays: 2,
    doubleRoundRobin: false,
    avoidBackToBack: true,
    balanceHomeAway: true
  });
  const [generatedFixtures, setGeneratedFixtures] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fixtureStep, setFixtureStep] = useState(1); // 1: Settings, 2: Preview, 3: Confirm

  // Add teams modal states
  const [isAddTeamsModalOpen, setIsAddTeamsModalOpen] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const [selectedTeamIds, setSelectedTeamIds] = useState([]);
  const [isAddingTeams, setIsAddingTeams] = useState(false);
  const [teamSearchTerm, setTeamSearchTerm] = useState('');

  // Manage teams modal states
  const [isManageTeamsModalOpen, setIsManageTeamsModalOpen] = useState(false);
  const [manageTeamsTab, setManageTeamsTab] = useState('current'); // 'current' or 'add'
  const [teamsToRemove, setTeamsToRemove] = useState([]);
  const [isRemovingTeams, setIsRemovingTeams] = useState(false);

  // Knockout bracket modal states
  const [isKnockoutBracketModalOpen, setIsKnockoutBracketModalOpen] = useState(false);

  // Delete league modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingLeague, setIsDeletingLeague] = useState(false);

  // Fixtures sorting and filtering states
  const [fixtureSortBy, setFixtureSortBy] = useState('date'); // 'date', 'team', 'venue', 'time'
  const [fixtureSortOrder, setFixtureSortOrder] = useState('asc'); // 'asc' or 'desc'
  const [sortedFixtures, setSortedFixtures] = useState([]);
  const [isRearranging, setIsRearranging] = useState(false);

  // Check if user has access (admin or staff)
  const userRole = userProfile?.role;
  const hasAccess = userRole === 'admin' || userRole === 'staff';

  // Redirect unauthorized users
  useEffect(() => {
    if (authLoading) return;
    
    if (!hasAccess) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [authLoading, hasAccess, navigate]);

  // Fetch leagues on mount
  useEffect(() => {
    if (hasAccess) {
      loadLeagues();
    }
  }, [hasAccess]);

  // Load league details when selected
  useEffect(() => {
    if (selectedLeague) {
      loadLeagueDetails(selectedLeague);
    }
  }, [selectedLeague]);

  // Apply sorting when fixtures or sort settings change
  useEffect(() => {
    if (leagueFixtures.length > 0) {
      const sorted = [...leagueFixtures].sort((a, b) => {
        let comparison = 0;
        
        switch (fixtureSortBy) {
          case 'date':
            comparison = new Date(a.scheduledDate || 0) - new Date(b.scheduledDate || 0);
            break;
          case 'time':
            const timeA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
            const timeB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
            comparison = timeA - timeB;
            break;
          case 'team':
            const aTeamName = `${a.homeTeam?.name || ''} vs ${a.awayTeam?.name || ''}`;
            const bTeamName = `${b.homeTeam?.name || ''} vs ${b.awayTeam?.name || ''}`;
            comparison = aTeamName.localeCompare(bTeamName);
            break;
          case 'venue':
            comparison = (a.venue || '').localeCompare(b.venue || '');
            break;
          default:
            comparison = 0;
        }
        
        return fixtureSortOrder === 'asc' ? comparison : -comparison;
      });
      
      setSortedFixtures(sorted);
    } else {
      setSortedFixtures([]);
    }
  }, [leagueFixtures, fixtureSortBy, fixtureSortOrder]);

  const loadLeagues = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await leagueService.getAll();
      setLeagues(data || []);
    } catch (err) {
      console.error('Error loading leagues:', err);
      setError(err.message || 'Failed to load leagues');
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeagueDetails = async (leagueId) => {
    setIsLoadingDetails(true);
    try {
      const details = await leagueService.getById(leagueId);
      setLeagueDetails(details);
      
      // Load fixtures for this league
      await loadLeagueFixtures(leagueId);
    } catch (err) {
      console.error('Error loading league details:', err);
      setError(err.message || 'Failed to load league details');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const loadLeagueFixtures = async (leagueId) => {
    setIsLoadingFixtures(true);
    try {
      const fixtures = await matchService.getByLeague(leagueId);
      setLeagueFixtures(fixtures || []);
      applySorting(fixtures || [], fixtureSortBy, fixtureSortOrder);
    } catch (err) {
      console.error('Error loading league fixtures:', err);
      // Don't set error state, just log it - fixtures are optional
    } finally {
      setIsLoadingFixtures(false);
    }
  };

  const applySorting = (fixtures, sortBy, sortOrder) => {
    const sorted = [...fixtures].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.scheduledDate || 0) - new Date(b.scheduledDate || 0);
          break;
        case 'time':
          const timeA = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0;
          const timeB = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0;
          comparison = timeA - timeB;
          break;
        case 'team':
          const aTeamName = `${a.homeTeam?.name || ''} vs ${a.awayTeam?.name || ''}`;
          const bTeamName = `${b.homeTeam?.name || ''} vs ${b.awayTeam?.name || ''}`;
          comparison = aTeamName.localeCompare(bTeamName);
          break;
        case 'venue':
          comparison = (a.venue || '').localeCompare(b.venue || '');
          break;
        default:
          comparison = 0;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    setSortedFixtures(sorted);
  };

  const handleSortChange = (sortBy) => {
    const newSortOrder = fixtureSortBy === sortBy && fixtureSortOrder === 'asc' ? 'desc' : 'asc';
    setFixtureSortBy(sortBy);
    setFixtureSortOrder(newSortOrder);
    applySorting(leagueFixtures, sortBy, newSortOrder);
  };

  const handleExportFixtures = async (format) => {
    const fixturesToExport = sortedFixtures.length > 0 ? sortedFixtures : leagueFixtures;
    const leagueName = leagueDetails?.name || 'League';
    const filename = `${leagueName.toLowerCase().replace(/\s+/g, '-')}-fixtures`;

    try {
      switch (format) {
        case 'pdf':
          await exportFixturesToPDF(fixturesToExport, leagueName, filename);
          break;
        case 'excel':
          await exportFixturesToExcel(fixturesToExport, leagueName, filename);
          break;
        case 'word':
          exportFixturesToWord(fixturesToExport, leagueName, filename);
          break;
        default:
          break;
      }
      setSuccess(`Fixtures exported to ${format.toUpperCase()} successfully!`);
    } catch (err) {
      console.error(`Error exporting to ${format}:`, err);
      setError(`Failed to export fixtures to ${format.toUpperCase()}`);
    }
  };

  const handleMoveFixture = async (fixtureId, direction) => {
    const fixtures = sortedFixtures.length > 0 ? sortedFixtures : leagueFixtures;
    const currentIndex = fixtures.findIndex(f => f.id === fixtureId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= fixtures.length) return;

    setIsRearranging(true);
    setError(null);

    try {
      const fixture1 = fixtures[currentIndex];
      const fixture2 = fixtures[newIndex];
      
      // Swap scheduled dates and times
      if (fixture1.scheduledDate && fixture2.scheduledDate) {
        const tempDate = fixture1.scheduledDate;
        
        // Update both fixtures with swapped dates
        await Promise.all([
          matchService.update(fixture1.id, {
            scheduledDate: fixture2.scheduledDate,
            venue: fixture1.venue
          }),
          matchService.update(fixture2.id, {
            scheduledDate: tempDate,
            venue: fixture2.venue
          })
        ]);
      } else if (fixture1.scheduledDate && !fixture2.scheduledDate) {
        // Move scheduled fixture to unscheduled position
        await matchService.update(fixture2.id, {
          scheduledDate: fixture1.scheduledDate,
          venue: fixture2.venue
        });
        await matchService.update(fixture1.id, {
          scheduledDate: null,
          venue: fixture1.venue
        });
      } else if (!fixture1.scheduledDate && fixture2.scheduledDate) {
        // Move unscheduled fixture to scheduled position
        await matchService.update(fixture1.id, {
          scheduledDate: fixture2.scheduledDate,
          venue: fixture1.venue
        });
        await matchService.update(fixture2.id, {
          scheduledDate: null,
          venue: fixture2.venue
        });
      }
      
      // Reload fixtures to get updated data
      await loadLeagueFixtures(selectedLeague);
      setSuccess('Fixture order updated successfully!');
    } catch (err) {
      console.error('Error rearranging fixtures:', err);
      setError(err.message || 'Failed to rearrange fixtures');
    } finally {
      setIsRearranging(false);
    }
  };

  const handleFixtureSettingChange = (field, value) => {
    setFixtureSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateFixtures = async () => {
    if (!leagueDetails || !leagueDetails.teams || leagueDetails.teams.length < 2) {
      setError('League must have at least 2 teams to generate fixtures');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const activeTeams = leagueDetails.teams
        .filter(lt => lt.isActive && lt.team)
        .map(lt => lt.team);
      
      if (activeTeams.length < 2) {
        setError('League must have at least 2 active teams');
        setIsGenerating(false);
        return;
      }

      const fixtures = [];
      const teams = [...activeTeams];
      let matchId = 1;
      const startDate = new Date(fixtureSettings.startDate);
      const endDate = new Date(fixtureSettings.endDate);
      const daysDiff = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
      
      // Generate round-robin fixtures
      const rounds = teams.length - 1;
      const matchesPerRound = Math.floor(teams.length / 2);
      
      for (let round = 0; round < rounds; round++) {
        for (let match = 0; match < matchesPerRound; match++) {
          const homeIndex = match;
          const awayIndex = teams.length - 1 - match;
          
          if (homeIndex < awayIndex) {
            const homeTeam = teams[homeIndex];
            const awayTeam = teams[awayIndex];
            
            // Calculate match date (distribute matches across available days)
            const matchDay = Math.floor((round * matchesPerRound + match) / matchesPerRound) * 7;
            const matchDate = new Date(startDate);
            matchDate.setDate(matchDate.getDate() + matchDay);
            
            // Get time slot
            const timeSlot = fixtureSettings.timeSlots[match % fixtureSettings.timeSlots.length] || '14:00';
            
            // Get venue
            const venue = fixtureSettings.venues.length > 0 
              ? fixtureSettings.venues[match % fixtureSettings.venues.length]
              : 'TBD';
            
            fixtures.push({
              id: matchId++,
              round: round + 1,
              homeTeamId: homeTeam.id,
              homeTeamName: homeTeam.name,
              awayTeamId: awayTeam.id,
              awayTeamName: awayTeam.name,
              date: matchDate.toISOString().split('T')[0],
              time: timeSlot,
              venue: venue,
              scheduledDate: `${matchDate.toISOString().split('T')[0]}T${timeSlot}:00`
            });
          }
        }
        
        // Rotate teams for next round (round-robin algorithm)
        const lastTeam = teams.pop();
        teams.splice(1, 0, lastTeam);
      }
      
      // Double round-robin if selected
      if (fixtureSettings.doubleRoundRobin) {
        const secondRound = fixtures.map(fixture => {
          const originalDate = new Date(fixture.scheduledDate);
          const newDate = new Date(originalDate);
          newDate.setDate(newDate.getDate() + (rounds * 7));
          
          return {
            ...fixture,
            id: matchId++,
            round: fixture.round + rounds,
            homeTeamId: fixture.awayTeamId,
            homeTeamName: fixture.awayTeamName,
            awayTeamId: fixture.homeTeamId,
            awayTeamName: fixture.homeTeamName,
            date: newDate.toISOString().split('T')[0],
            scheduledDate: `${newDate.toISOString().split('T')[0]}T${fixture.time}:00`
          };
        });
        fixtures.push(...secondRound);
      }
      
      setGeneratedFixtures(fixtures);
      setFixtureStep(2);
    } catch (err) {
      console.error('Error generating fixtures:', err);
      setError(err.message || 'Failed to generate fixtures');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveFixtures = async () => {
    if (!selectedLeague || !leagueDetails) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Create matches in database
      const matchPromises = generatedFixtures.map(fixture => 
        matchService.create({
          leagueId: selectedLeague,
          homeTeamId: fixture.homeTeamId,
          awayTeamId: fixture.awayTeamId,
          scheduledDate: fixture.scheduledDate,
          venue: fixture.venue,
          matchStatus: 'scheduled'
        })
      );
      
      await Promise.all(matchPromises);
      
      setSuccess(`Successfully created ${generatedFixtures.length} matches!`);
      setFixtureStep(3);
      
      // Reload league details and fixtures to show new matches
      setTimeout(() => {
        loadLeagueDetails(selectedLeague);
        setIsFixtureModalOpen(false);
        setFixtureStep(1);
        setGeneratedFixtures([]);
      }, 2000);
    } catch (err) {
      console.error('Error saving fixtures:', err);
      setError(err.message || 'Failed to save fixtures');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenFixtureGenerator = (leagueId) => {
    setSelectedLeague(leagueId);
    setIsFixtureModalOpen(true);
    setFixtureStep(1);
    setGeneratedFixtures([]);
    setError(null);
  };

  const handleOpenAddTeamsModal = async () => {
    if (!selectedLeague) return;
    
    setIsAddTeamsModalOpen(true);
    setIsLoadingTeams(true);
    setSelectedTeamIds([]);
    setTeamSearchTerm('');
    setError(null);
    
    try {
      // Fetch all teams
      const allTeams = await teamService.getAll();
      
      // Get teams already in the league
      const leagueTeamIds = leagueDetails?.teams?.map(lt => lt.team?.id).filter(Boolean) || [];
      
      // Filter out teams already in the league
      const available = allTeams.filter(team => !leagueTeamIds.includes(team.id));
      
      setAvailableTeams(available);
    } catch (err) {
      console.error('Error loading teams:', err);
      setError(err.message || 'Failed to load available teams');
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleOpenManageTeamsModal = async () => {
    if (!selectedLeague) return;
    
    setIsManageTeamsModalOpen(true);
    setManageTeamsTab('current');
    setTeamsToRemove([]);
    setSelectedTeamIds([]);
    setTeamSearchTerm('');
    setError(null);
    
    // Load available teams for the add tab
    setIsLoadingTeams(true);
    try {
      const allTeams = await teamService.getAll();
      const leagueTeamIds = leagueDetails?.teams?.map(lt => lt.team?.id).filter(Boolean) || [];
      const available = allTeams.filter(team => !leagueTeamIds.includes(team.id));
      setAvailableTeams(available);
    } catch (err) {
      console.error('Error loading teams:', err);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleToggleTeamRemoval = (teamId) => {
    setTeamsToRemove(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleRemoveTeamsFromLeague = async () => {
    if (!selectedLeague || teamsToRemove.length === 0) return;
    
    setIsRemovingTeams(true);
    setError(null);
    
    try {
      // Remove each selected team from the league
      const removePromises = teamsToRemove.map(teamId => 
        leagueService.removeTeam(selectedLeague, teamId)
      );
      
      await Promise.all(removePromises);
      
      setSuccess(`Successfully removed ${teamsToRemove.length} team(s) from the league!`);
      
      // Reload league details
      await loadLeagueDetails(selectedLeague);
      
      // Reset and close modal
      setTimeout(() => {
        setIsManageTeamsModalOpen(false);
        setTeamsToRemove([]);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error removing teams from league:', err);
      setError(err.message || 'Failed to remove teams from league');
    } finally {
      setIsRemovingTeams(false);
    }
  };

  const handleToggleTeamSelection = (teamId) => {
    setSelectedTeamIds(prev => 
      prev.includes(teamId)
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleAddTeamsToLeague = async () => {
    if (!selectedLeague || selectedTeamIds.length === 0) return;
    
    setIsAddingTeams(true);
    setError(null);
    
    try {
      // Add each selected team to the league
      const addPromises = selectedTeamIds.map(teamId => 
        leagueService.addTeam(selectedLeague, teamId)
      );
      
      await Promise.all(addPromises);
      
      setSuccess(`Successfully added ${selectedTeamIds.length} team(s) to the league!`);
      
      // Reload league details
      await loadLeagueDetails(selectedLeague);
      
      // If in manage teams modal, refresh available teams and switch to current tab
      if (isManageTeamsModalOpen) {
        // Wait a bit for league details to update, then refresh available teams
        setTimeout(async () => {
          setIsLoadingTeams(true);
          try {
            const allTeams = await teamService.getAll();
            // Get updated league details
            const updatedDetails = await leagueService.getById(selectedLeague);
            const leagueTeamIds = updatedDetails?.teams?.map(lt => lt.team?.id).filter(Boolean) || [];
            const available = allTeams.filter(team => !leagueTeamIds.includes(team.id));
            setAvailableTeams(available);
          } catch (err) {
            console.error('Error loading teams:', err);
          } finally {
            setIsLoadingTeams(false);
          }
        }, 500);
        
        // Reset selection and switch to current teams tab
        setSelectedTeamIds([]);
        setTeamSearchTerm('');
        setManageTeamsTab('current');
      } else {
        // Close add teams modal and reset
        setTimeout(() => {
          setIsAddTeamsModalOpen(false);
          setSelectedTeamIds([]);
          setTeamSearchTerm('');
          setSuccess(null);
        }, 2000);
      }
    } catch (err) {
      console.error('Error adding teams to league:', err);
      setError(err.message || 'Failed to add teams to league');
    } finally {
      setIsAddingTeams(false);
    }
  };

  // Filter teams based on search term
  const filteredTeams = availableTeams.filter(team => 
    team.name?.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
    team.shortName?.toLowerCase().includes(teamSearchTerm.toLowerCase()) ||
    team.city?.toLowerCase().includes(teamSearchTerm.toLowerCase())
  );

  // Handle delete league
  const handleDeleteLeague = async () => {
    if (!selectedLeague) return;

    setIsDeletingLeague(true);
    setError(null);

    try {
      await leagueService.delete(selectedLeague);
      setSuccess('League deleted successfully!');
      
      // Clear selected league and reload leagues
      setSelectedLeague(null);
      setLeagueDetails(null);
      setLeagueFixtures([]);
      await loadLeagues();
      
      // Close modal after a short delay
      setTimeout(() => {
        setIsDeleteModalOpen(false);
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Error deleting league:', err);
      setError(err.message || 'Failed to delete league');
    } finally {
      setIsDeletingLeague(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date);
    } catch {
      return '-';
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return '-';
    }
  };

  const getMatchStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-primary/10 text-primary';
      case 'live':
        return 'bg-error/10 text-error';
      case 'completed':
        return 'bg-success/10 text-success';
      case 'postponed':
        return 'bg-warning/10 text-warning';
      case 'cancelled':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

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
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', path: '/admin-dashboard' },
    { label: 'League Management', path: '/league-management' },
    { label: 'League Organizer' }
  ];

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
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="Trophy" size={24} className="text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">League Organizer</h1>
                    <p className="text-muted-foreground">Manage leagues and set up match fixtures</p>
                  </div>
                </div>
              </div>
              <Button
                variant="default"
                onClick={() => navigate('/league-setup')}
                iconName="Plus"
                iconPosition="left"
              >
                Create New League
              </Button>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 px-4 py-3 rounded-lg border bg-success/10 border-success/20 text-success">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={18} />
                <p className="font-medium">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={18} />
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Leagues List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={48} className="text-primary animate-spin" />
            </div>
          ) : leagues.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center card-shadow">
              <Icon name="Trophy" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Leagues Found</h3>
              <p className="text-muted-foreground mb-4">Create your first league to get started</p>
              <Button
                variant="default"
                onClick={() => navigate('/league-setup')}
                iconName="Plus"
                iconPosition="left"
              >
                Create New League
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Leagues List */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-card border border-border rounded-lg p-4 card-shadow">
                  <h2 className="text-lg font-semibold text-foreground mb-4">Leagues</h2>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto">
                    {leagues.map((league) => (
                      <div
                        key={league.id}
                        onClick={() => setSelectedLeague(league.id)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedLeague === league.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground">{league.name}</h3>
                            <p className="text-sm text-muted-foreground">{league.season}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                league.leagueStatus === 'active'
                                  ? 'bg-success/10 text-success'
                                  : league.leagueStatus === 'upcoming'
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-muted text-muted-foreground'
                              }`}>
                                {league.leagueStatus || 'upcoming'}
                              </span>
                            </div>
                          </div>
                          <Icon 
                            name={selectedLeague === league.id ? "ChevronRight" : "ChevronLeft"} 
                            size={16} 
                            className="text-muted-foreground"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* League Details */}
              <div className="lg:col-span-2 space-y-6">
                {!selectedLeague ? (
                  <div className="bg-card border border-border rounded-lg p-12 text-center card-shadow">
                    <Icon name="Trophy" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Select a League</h3>
                    <p className="text-muted-foreground">Choose a league from the list to view details and manage fixtures</p>
                  </div>
                ) : isLoadingDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <Icon name="Loader2" size={48} className="text-primary animate-spin" />
                  </div>
                ) : leagueDetails ? (
                  <>
                    {/* League Header */}
                    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">{leagueDetails.name}</h2>
                          <p className="text-muted-foreground">{leagueDetails.season}</p>
                          {leagueDetails.description && (
                            <p className="text-sm text-muted-foreground mt-2">{leagueDetails.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            onClick={() => navigate(`/league-setup/${selectedLeague}`)}
                            iconName="Edit"
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsKnockoutBracketModalOpen(true)}
                            iconName="GitBranch"
                            size="sm"
                            disabled={!leagueDetails.teams || leagueDetails.teams.length < 2}
                          >
                            Create Knockout Bracket
                          </Button>
                          <Button
                            variant="default"
                            onClick={() => handleOpenFixtureGenerator(selectedLeague)}
                            iconName="Calendar"
                            size="sm"
                            disabled={!leagueDetails.teams || leagueDetails.teams.length < 2}
                          >
                            Generate Fixtures
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => setIsDeleteModalOpen(true)}
                            iconName="Trash2"
                            size="sm"
                          >
                            Delete
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <p className="font-semibold text-foreground capitalize">{leagueDetails.leagueStatus || 'upcoming'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Teams</p>
                          <p className="font-semibold text-foreground">
                            {leagueDetails.teams?.length || 0} / {leagueDetails.maxTeams || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Start Date</p>
                          <p className="font-semibold text-foreground">{formatDate(leagueDetails.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">End Date</p>
                          <p className="font-semibold text-foreground">{formatDate(leagueDetails.endDate)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Teams in League */}
                    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">Teams in League</h3>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleOpenAddTeamsModal}
                            iconName="Plus"
                            iconPosition="left"
                          >
                            Add Teams
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleOpenManageTeamsModal}
                            iconName="Users"
                          >
                            Manage Teams
                          </Button>
                        </div>
                      </div>
                      
                      {!leagueDetails.teams || leagueDetails.teams.length === 0 ? (
                        <div className="text-center py-8">
                          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">No teams added to this league yet</p>
                          <Button
                            variant="default"
                            onClick={handleOpenAddTeamsModal}
                            iconName="Plus"
                            iconPosition="left"
                          >
                            Add Teams
                          </Button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {leagueDetails.teams.map((leagueTeam) => (
                            <div
                              key={leagueTeam.id}
                              className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border"
                            >
                              {leagueTeam.team?.logoUrl ? (
                                <Image
                                  src={leagueTeam.team.logoUrl}
                                  alt={leagueTeam.team.name}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                                  <Icon name="Shield" size={24} className="text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {leagueTeam.team?.name || 'Unknown Team'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {leagueTeam.isActive ? 'Active' : 'Inactive'}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* League Fixtures */}
                    <div className="bg-card border border-border rounded-lg p-6 card-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-foreground">League Fixtures</h3>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">
                            {leagueFixtures.length} match{leagueFixtures.length !== 1 ? 'es' : ''}
                          </div>
                        </div>
                      </div>

                      {/* Controls Bar */}
                      {leagueFixtures.length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 mb-4 p-3 bg-muted/30 rounded-lg border border-border">
                          {/* Sort Controls */}
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Sort by:</span>
                            <div className="flex items-center gap-1">
                              {[
                                { value: 'date', label: 'Date' },
                                { value: 'time', label: 'Time' },
                                { value: 'team', label: 'Team' },
                                { value: 'venue', label: 'Venue' }
                              ].map((option) => (
                                <Button
                                  key={option.value}
                                  variant={fixtureSortBy === option.value ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => handleSortChange(option.value)}
                                  className="h-7 text-xs"
                                >
                                  {option.label}
                                  {fixtureSortBy === option.value && (
                                    <Icon 
                                      name={fixtureSortOrder === 'asc' ? 'ArrowUp' : 'ArrowDown'} 
                                      size={12} 
                                      className="ml-1" 
                                    />
                                  )}
                                </Button>
                              ))}
                            </div>
                          </div>

                          <div className="h-4 w-px bg-border" />

                          {/* Export Controls */}
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">Export:</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExportFixtures('pdf')}
                              title="Export to PDF"
                              className="h-7 px-2"
                            >
                              <Icon name="FileText" size={14} className="mr-1" />
                              <span className="text-xs">PDF</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExportFixtures('excel')}
                              title="Export to Excel"
                              className="h-7 px-2"
                            >
                              <Icon name="Table" size={14} className="mr-1" />
                              <span className="text-xs">Excel</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleExportFixtures('word')}
                              title="Export to Word"
                              className="h-7 px-2"
                            >
                              <Icon name="File" size={14} className="mr-1" />
                              <span className="text-xs">Word</span>
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {isLoadingFixtures ? (
                        <div className="flex items-center justify-center py-8">
                          <Icon name="Loader2" size={24} className="text-primary animate-spin" />
                        </div>
                      ) : leagueFixtures.length === 0 ? (
                        <div className="text-center py-8">
                          <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground mb-4">No fixtures scheduled for this league yet</p>
                          <Button
                            variant="outline"
                            onClick={() => handleOpenFixtureGenerator(selectedLeague)}
                            iconName="Calendar"
                            iconPosition="left"
                            disabled={!leagueDetails.teams || leagueDetails.teams.length < 2}
                          >
                            Generate Fixtures
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {(sortedFixtures.length > 0 ? sortedFixtures : leagueFixtures).map((fixture, index) => (
                            <div
                              key={fixture.id}
                              className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                            >
                              {/* Rearrange Controls */}
                              <div className="flex flex-col gap-1 mr-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveFixture(fixture.id, 'up')}
                                  disabled={index === 0 || isRearranging}
                                  className="h-6 w-6 p-0"
                                  title="Move up"
                                >
                                  <Icon name="ChevronUp" size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveFixture(fixture.id, 'down')}
                                  disabled={index === (sortedFixtures.length > 0 ? sortedFixtures : leagueFixtures).length - 1 || isRearranging}
                                  className="h-6 w-6 p-0"
                                  title="Move down"
                                >
                                  <Icon name="ChevronDown" size={14} />
                                </Button>
                              </div>

                              <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Date & Time */}
                                <div className="flex-shrink-0 text-center min-w-[100px]">
                                  <p className="text-xs text-muted-foreground">Date</p>
                                  <p className="text-sm font-medium text-foreground">
                                    {formatDate(fixture.scheduledDate)}
                                  </p>
                                  {fixture.scheduledDate && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {new Date(fixture.scheduledDate).toLocaleTimeString('en-US', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </p>
                                  )}
                                </div>

                                {/* Teams */}
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  {/* Home Team */}
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    {fixture.homeTeam?.logoUrl ? (
                                      <Image
                                        src={fixture.homeTeam.logoUrl}
                                        alt={fixture.homeTeam.name}
                                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                        <Icon name="Shield" size={16} className="text-muted-foreground" />
                                      </div>
                                    )}
                                    <p className="text-sm font-medium text-foreground truncate">
                                      {fixture.homeTeam?.name || fixture.homeTeam?.shortName || 'TBD'}
                                    </p>
                                  </div>

                                  {/* Score or VS */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    {fixture.matchStatus === 'completed' && (
                                      <>
                                        <span className="text-sm font-bold text-foreground">
                                          {fixture.homeScore || 0}
                                        </span>
                                        <span className="text-muted-foreground">-</span>
                                        <span className="text-sm font-bold text-foreground">
                                          {fixture.awayScore || 0}
                                        </span>
                                      </>
                                    )}
                                    {fixture.matchStatus === 'live' && (
                                      <>
                                        <span className="text-sm font-bold text-error">
                                          {fixture.homeScore || 0}
                                        </span>
                                        <span className="text-error animate-pulse">•</span>
                                        <span className="text-sm font-bold text-error">
                                          {fixture.awayScore || 0}
                                        </span>
                                      </>
                                    )}
                                    {fixture.matchStatus === 'scheduled' && (
                                      <span className="text-xs text-muted-foreground">vs</span>
                                    )}
                                  </div>

                                  {/* Away Team */}
                                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                                    <p className="text-sm font-medium text-foreground truncate text-right">
                                      {fixture.awayTeam?.name || fixture.awayTeam?.shortName || 'TBD'}
                                    </p>
                                    {fixture.awayTeam?.logoUrl ? (
                                      <Image
                                        src={fixture.awayTeam.logoUrl}
                                        alt={fixture.awayTeam.name}
                                        className="w-8 h-8 rounded object-cover flex-shrink-0"
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded bg-muted flex items-center justify-center flex-shrink-0">
                                        <Icon name="Shield" size={16} className="text-muted-foreground" />
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Venue & Status */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  {fixture.venue && (
                                    <div className="text-right">
                                      <p className="text-xs text-muted-foreground">Venue</p>
                                      <p className="text-xs font-medium text-foreground truncate max-w-[120px]">
                                        {fixture.venue}
                                      </p>
                                    </div>
                                  )}
                                  <span className={`text-xs px-2 py-1 rounded-full capitalize ${getMatchStatusColor(fixture.matchStatus)}`}>
                                    {fixture.matchStatus || 'scheduled'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-card border border-border rounded-lg p-12 text-center card-shadow">
                    <Icon name="AlertTriangle" size={48} className="text-warning mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">League Not Found</h3>
                    <p className="text-muted-foreground">The selected league could not be loaded</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Manage Teams Modal */}
          {isManageTeamsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsManageTeamsModalOpen(false)} />
              <div className="relative bg-card border border-border rounded-lg modal-shadow w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Users" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Manage League Teams</h2>
                      <p className="text-sm text-muted-foreground">
                        {leagueDetails?.name} - {leagueDetails?.season}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsManageTeamsModalOpen(false);
                      setTeamsToRemove([]);
                      setSelectedTeamIds([]);
                      setTeamSearchTerm('');
                      setManageTeamsTab('current');
                    }}
                    iconName="X"
                  />
                </div>

                {/* Tabs */}
                <div className="px-6 pt-4 border-b border-border">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setManageTeamsTab('current')}
                      className={`pb-3 px-1 border-b-2 transition-colors ${
                        manageTeamsTab === 'current'
                          ? 'border-primary text-primary font-medium'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Current Teams ({leagueDetails?.teams?.length || 0})
                    </button>
                    <button
                      onClick={() => setManageTeamsTab('add')}
                      className={`pb-3 px-1 border-b-2 transition-colors ${
                        manageTeamsTab === 'add'
                          ? 'border-primary text-primary font-medium'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Add Teams
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                <div className="p-6">
                  {/* Current Teams Tab */}
                  {manageTeamsTab === 'current' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-foreground">Teams in League</h3>
                        {teamsToRemove.length > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleRemoveTeamsFromLeague}
                            loading={isRemovingTeams}
                            iconName="Trash2"
                            iconPosition="left"
                          >
                            Remove {teamsToRemove.length} Team{teamsToRemove.length !== 1 ? 's' : ''}
                          </Button>
                        )}
                      </div>

                      {!leagueDetails?.teams || leagueDetails.teams.length === 0 ? (
                        <div className="text-center py-12">
                          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">No teams in this league</p>
                        </div>
                      ) : (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {leagueDetails.teams.map((leagueTeam) => {
                            const team = leagueTeam.team;
                            const isSelected = teamsToRemove.includes(team?.id);
                            return (
                              <div
                                key={leagueTeam.id}
                                onClick={() => handleToggleTeamRemoval(team?.id)}
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-error bg-error/5'
                                    : 'border-border hover:border-primary/50'
                                }`}
                              >
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                  isSelected
                                    ? 'border-error bg-error'
                                    : 'border-border'
                                }`}>
                                  {isSelected && (
                                    <Icon name="Check" size={14} className="text-error-foreground" />
                                  )}
                                </div>
                                {team?.logoUrl ? (
                                  <Image
                                    src={team.logoUrl}
                                    alt={team.name}
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                    <Icon name="Shield" size={20} className="text-muted-foreground" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-foreground truncate">
                                    {team?.name || 'Unknown Team'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {team?.shortName} {team?.city && `• ${team.city}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    leagueTeam.isActive
                                      ? 'bg-success/10 text-success'
                                      : 'bg-muted text-muted-foreground'
                                  }`}>
                                    {leagueTeam.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                  {team?.category && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                      {team.category}
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add Teams Tab */}
                  {manageTeamsTab === 'add' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-medium text-foreground">Available Teams</h3>
                        {selectedTeamIds.length > 0 && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={handleAddTeamsToLeague}
                            loading={isAddingTeams}
                            iconName="Plus"
                            iconPosition="left"
                          >
                            Add {selectedTeamIds.length} Team{selectedTeamIds.length !== 1 ? 's' : ''}
                          </Button>
                        )}
                      </div>

                      {/* Search */}
                      <div className="mb-4">
                        <Input
                          label="Search Teams"
                          placeholder="Search by name, short name, or city..."
                          value={teamSearchTerm}
                          onChange={(e) => setTeamSearchTerm(e.target.value)}
                          iconName="Search"
                        />
                      </div>

                      {/* Teams List */}
                      {isLoadingTeams ? (
                        <div className="flex items-center justify-center py-12">
                          <Icon name="Loader2" size={32} className="text-primary animate-spin" />
                        </div>
                      ) : filteredTeams.length === 0 ? (
                        <div className="text-center py-12">
                          <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">
                            {teamSearchTerm ? 'No teams found matching your search' : 'No available teams to add'}
                          </p>
                        </div>
                      ) : (
                        <>
                          <div className="mb-4">
                            <p className="text-sm text-muted-foreground">
                              {selectedTeamIds.length} team(s) selected • {filteredTeams.length} available
                            </p>
                          </div>
                          <div className="max-h-96 overflow-y-auto space-y-2 border border-border rounded-lg p-4">
                            {filteredTeams.map((team) => {
                              const isSelected = selectedTeamIds.includes(team.id);
                              return (
                                <div
                                  key={team.id}
                                  onClick={() => handleToggleTeamSelection(team.id)}
                                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                    isSelected
                                      ? 'border-primary bg-primary/5'
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                                    isSelected
                                      ? 'border-primary bg-primary'
                                      : 'border-border'
                                  }`}>
                                    {isSelected && (
                                      <Icon name="Check" size={14} className="text-primary-foreground" />
                                    )}
                                  </div>
                                  {team.logoUrl ? (
                                    <Image
                                      src={team.logoUrl}
                                      alt={team.name}
                                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                                      <Icon name="Shield" size={20} className="text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-foreground truncate">
                                      {team.name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {team.shortName} {team.city && `• ${team.city}`}
                                    </p>
                                  </div>
                                  {team.category && (
                                    <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                      {team.category}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsManageTeamsModalOpen(false);
                        setTeamsToRemove([]);
                        setSelectedTeamIds([]);
                        setTeamSearchTerm('');
                        setManageTeamsTab('current');
                      }}
                      disabled={isRemovingTeams || isAddingTeams}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Teams Modal */}
          {isAddTeamsModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsAddTeamsModalOpen(false)} />
              <div className="relative bg-card border border-border rounded-lg modal-shadow w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Users" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Add Teams to League</h2>
                      <p className="text-sm text-muted-foreground">
                        {leagueDetails?.name} - {leagueDetails?.season}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsAddTeamsModalOpen(false);
                      setSelectedTeamIds([]);
                      setTeamSearchTerm('');
                    }}
                    iconName="X"
                  />
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Search */}
                  <div className="mb-4">
                    <Input
                      label="Search Teams"
                      placeholder="Search by name, short name, or city..."
                      value={teamSearchTerm}
                      onChange={(e) => setTeamSearchTerm(e.target.value)}
                      iconName="Search"
                    />
                  </div>

                  {/* Teams List */}
                  {isLoadingTeams ? (
                    <div className="flex items-center justify-center py-12">
                      <Icon name="Loader2" size={32} className="text-primary animate-spin" />
                    </div>
                  ) : filteredTeams.length === 0 ? (
                    <div className="text-center py-12">
                      <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {teamSearchTerm ? 'No teams found matching your search' : 'No available teams to add'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground">
                          {selectedTeamIds.length} team(s) selected • {filteredTeams.length} available
                        </p>
                      </div>
                      <div className="max-h-96 overflow-y-auto space-y-2 border border-border rounded-lg p-4">
                        {filteredTeams.map((team) => {
                          const isSelected = selectedTeamIds.includes(team.id);
                          return (
                            <div
                              key={team.id}
                              onClick={() => handleToggleTeamSelection(team.id)}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                                isSelected
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                isSelected
                                  ? 'border-primary bg-primary'
                                  : 'border-border'
                              }`}>
                                {isSelected && (
                                  <Icon name="Check" size={14} className="text-primary-foreground" />
                                )}
                              </div>
                              {team.logoUrl ? (
                                <Image
                                  src={team.logoUrl}
                                  alt={team.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                                  <Icon name="Shield" size={20} className="text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground truncate">
                                  {team.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {team.shortName} {team.city && `• ${team.city}`}
                                </p>
                              </div>
                              {team.category && (
                                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                                  {team.category}
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border mt-6">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsAddTeamsModalOpen(false);
                        setSelectedTeamIds([]);
                        setTeamSearchTerm('');
                      }}
                      disabled={isAddingTeams}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="default"
                      onClick={handleAddTeamsToLeague}
                      loading={isAddingTeams}
                      disabled={selectedTeamIds.length === 0 || isAddingTeams}
                      iconName="Plus"
                      iconPosition="left"
                    >
                      Add {selectedTeamIds.length > 0 ? `${selectedTeamIds.length} ` : ''}Team{selectedTeamIds.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fixture Generator Modal */}
          {isFixtureModalOpen && leagueDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsFixtureModalOpen(false)} />
              <div className="relative bg-card border border-border rounded-lg modal-shadow w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Calendar" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Generate Fixtures</h2>
                      <p className="text-sm text-muted-foreground">{leagueDetails.name} - {leagueDetails.season}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsFixtureModalOpen(false);
                      setFixtureStep(1);
                      setGeneratedFixtures([]);
                    }}
                    iconName="X"
                  />
                </div>

                {/* Progress Steps */}
                <div className="px-6 py-4 border-b border-border">
                  <div className="flex items-center space-x-4">
                    {[1, 2, 3].map((stepNum) => (
                      <div key={stepNum} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          fixtureStep >= stepNum 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {stepNum}
                        </div>
                        <span className={`ml-2 text-sm ${
                          fixtureStep >= stepNum ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {stepNum === 1 ? 'Settings' : stepNum === 2 ? 'Preview' : 'Confirm'}
                        </span>
                        {stepNum < 3 && (
                          <Icon name="ChevronRight" size={16} className="mx-4 text-muted-foreground" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step Content */}
                <div className="p-6">
                  {fixtureStep === 1 && (
                    <div className="space-y-6">
                      <h3 className="text-lg font-medium text-foreground">Fixture Generation Settings</h3>
                      
                      {/* Teams Info */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-sm text-muted-foreground mb-2">Teams in League:</p>
                        <p className="font-semibold text-foreground">
                          {leagueDetails.teams?.filter(lt => lt.isActive && lt.team).length || 0} active teams
                        </p>
                        {(!leagueDetails.teams || leagueDetails.teams.filter(lt => lt.isActive && lt.team).length < 2) && (
                          <p className="text-xs text-warning mt-2">
                            ⚠️ At least 2 active teams are required to generate fixtures
                          </p>
                        )}
                      </div>
                      
                      {/* Date Range */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Start Date"
                          type="date"
                          value={fixtureSettings.startDate}
                          onChange={(e) => handleFixtureSettingChange('startDate', e.target.value)}
                          required
                        />
                        <Input
                          label="End Date"
                          type="date"
                          value={fixtureSettings.endDate}
                          onChange={(e) => handleFixtureSettingChange('endDate', e.target.value)}
                          required
                        />
                      </div>

                      {/* Match Days */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Match Days</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {dayOptions.map((day) => (
                            <label key={day.value} className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={fixtureSettings.matchDays.includes(day.value)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    handleFixtureSettingChange('matchDays', [...fixtureSettings.matchDays, day.value]);
                                  } else {
                                    handleFixtureSettingChange('matchDays', fixtureSettings.matchDays.filter(d => d !== day.value));
                                  }
                                }}
                                className="rounded border-border"
                              />
                              <span className="text-sm text-foreground">{day.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Time Slots */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Time Slots</label>
                        <div className="flex flex-wrap gap-2">
                          {fixtureSettings.timeSlots.map((time, index) => (
                            <div key={index} className="flex items-center space-x-2 bg-muted rounded-md px-3 py-2">
                              <span className="text-sm text-foreground">{time}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newSlots = fixtureSettings.timeSlots.filter((_, i) => i !== index);
                                  handleFixtureSettingChange('timeSlots', newSlots);
                                }}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <Icon name="X" size={14} />
                              </button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const time = prompt('Enter time (HH:MM format):');
                              if (time && /^\d{2}:\d{2}$/.test(time)) {
                                handleFixtureSettingChange('timeSlots', [...fixtureSettings.timeSlots, time]);
                              }
                            }}
                            iconName="Plus"
                          >
                            Add Time
                          </Button>
                        </div>
                      </div>

                      {/* Venues */}
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Venues</label>
                        <Input
                          type="text"
                          placeholder="Enter venue names separated by commas"
                          value={fixtureSettings.venues.join(', ')}
                          onChange={(e) => {
                            const venues = e.target.value.split(',').map(v => v.trim()).filter(v => v);
                            handleFixtureSettingChange('venues', venues);
                          }}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Separate multiple venues with commas (e.g., National Stadium, Uhuru Stadium)
                        </p>
                      </div>

                      {/* Advanced Options */}
                      <div className="space-y-3">
                        <h4 className="text-md font-medium text-foreground">Advanced Options</h4>
                        
                        <Input
                          label="Minimum Rest Days Between Matches"
                          type="number"
                          value={fixtureSettings.restDays}
                          onChange={(e) => handleFixtureSettingChange('restDays', parseInt(e.target.value) || 0)}
                          min="0"
                          max="14"
                        />

                        <div className="space-y-2">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fixtureSettings.doubleRoundRobin}
                              onChange={(e) => handleFixtureSettingChange('doubleRoundRobin', e.target.checked)}
                              className="rounded border-border"
                            />
                            <span className="text-sm text-foreground">Double Round-Robin (Home & Away)</span>
                          </label>
                          
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fixtureSettings.avoidBackToBack}
                              onChange={(e) => handleFixtureSettingChange('avoidBackToBack', e.target.checked)}
                              className="rounded border-border"
                            />
                            <span className="text-sm text-foreground">Avoid Back-to-Back Matches</span>
                          </label>
                          
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fixtureSettings.balanceHomeAway}
                              onChange={(e) => handleFixtureSettingChange('balanceHomeAway', e.target.checked)}
                              className="rounded border-border"
                            />
                            <span className="text-sm text-foreground">Balance Home/Away Distribution</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          onClick={() => setIsFixtureModalOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          onClick={generateFixtures}
                          loading={isGenerating}
                          iconName="Zap"
                          iconPosition="left"
                          disabled={
                            !fixtureSettings.startDate || 
                            !fixtureSettings.endDate || 
                            !leagueDetails.teams || 
                            leagueDetails.teams.filter(lt => lt.isActive && lt.team).length < 2
                          }
                        >
                          Generate Fixtures
                        </Button>
                      </div>
                    </div>
                  )}

                  {fixtureStep === 2 && (
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-foreground">Fixture Preview</h3>
                        <div className="text-sm text-muted-foreground">
                          {generatedFixtures.length} matches generated
                        </div>
                      </div>

                      <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                        <div className="space-y-4">
                          {generatedFixtures.slice(0, 20).map((fixture, index) => (
                            <div key={index} className="flex items-center justify-between bg-card rounded-md p-3 border border-border">
                              <div className="flex items-center space-x-4">
                                <div className="text-sm font-medium text-foreground">
                                  Round {fixture.round}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {fixture.homeTeamName} vs {fixture.awayTeamName}
                                </div>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>{fixture.date}</span>
                                <span>{fixture.time}</span>
                                <span>{fixture.venue}</span>
                              </div>
                            </div>
                          ))}
                          {generatedFixtures.length > 20 && (
                            <div className="text-center text-sm text-muted-foreground">
                              ... and {generatedFixtures.length - 20} more matches
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <Button
                          variant="outline"
                          onClick={() => setFixtureStep(1)}
                          iconName="ChevronLeft"
                          iconPosition="left"
                        >
                          Back to Settings
                        </Button>
                        <Button
                          variant="default"
                          onClick={handleSaveFixtures}
                          loading={isGenerating}
                          iconName="Check"
                          iconPosition="left"
                        >
                          Save Fixtures
                        </Button>
                      </div>
                    </div>
                  )}

                  {fixtureStep === 3 && (
                    <div className="text-center space-y-6 py-8">
                      <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                        <Icon name="CheckCircle" size={32} className="text-success" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">Fixtures Generated Successfully!</h3>
                        <p className="text-muted-foreground mt-2">
                          {generatedFixtures.length} matches have been created for {leagueDetails.name}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Knockout Bracket Modal */}
          {isKnockoutBracketModalOpen && selectedLeague && leagueDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsKnockoutBracketModalOpen(false)} />
              <div className="relative bg-card border border-border rounded-lg modal-shadow w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <KnockoutBracket
                    leagueId={selectedLeague}
                    leagueDetails={leagueDetails}
                    onClose={() => setIsKnockoutBracketModalOpen(false)}
                    onSuccess={() => {
                      setSuccess('Knockout bracket created successfully!');
                      loadLeagueDetails(selectedLeague);
                      setTimeout(() => setSuccess(null), 3000);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Delete League Confirmation Modal */}
          {isDeleteModalOpen && selectedLeague && leagueDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
              <div className="relative bg-card border border-border rounded-lg modal-shadow w-full max-w-md">
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                      <Icon name="AlertTriangle" size={24} className="text-destructive" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">Delete League</h3>
                      <p className="text-sm text-muted-foreground mt-1">This action cannot be undone</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-foreground mb-2">
                      Are you sure you want to delete <span className="font-semibold">{leagueDetails.name}</span>?
                    </p>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                      <p className="text-muted-foreground">
                        <Icon name="Info" size={16} className="inline mr-2" />
                        This will permanently delete the league and all associated data.
                      </p>
                      {leagueDetails.teams && leagueDetails.teams.length > 0 && (
                        <p className="text-warning">
                          <Icon name="AlertCircle" size={16} className="inline mr-2" />
                          This league has {leagueDetails.teams.length} team(s). All teams must be removed first.
                        </p>
                      )}
                      {leagueFixtures && leagueFixtures.length > 0 && (
                        <p className="text-warning">
                          <Icon name="AlertCircle" size={16} className="inline mr-2" />
                          This league has {leagueFixtures.length} match(es). All matches must be removed first.
                        </p>
                      )}
                    </div>
                  </div>

                  {error && (
                    <div className="mb-4 px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive text-sm">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="mb-4 px-4 py-3 rounded-lg border bg-success/10 border-success/20 text-success text-sm">
                      {success}
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setError(null);
                      }}
                      disabled={isDeletingLeague}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteLeague}
                      loading={isDeletingLeague}
                      iconName="Trash2"
                      iconPosition="left"
                    >
                      {isDeletingLeague ? 'Deleting...' : 'Delete League'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default LeagueOrganizer;

