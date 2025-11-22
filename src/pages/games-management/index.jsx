import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import { leagueService } from '../../services/leagueService';
import { matchService } from '../../services/matchService';
import { teamService } from '../../services/teamService';
import Image from '../../components/AppImage';
import MatchSetupModal from './components/MatchSetupModal';
import GamesFilterHeader from './components/GamesFilterHeader';
import { exportFixturesToCSV, exportFixturesToExcel, exportFixturesToPDF, exportFixturesToWord } from '../../utils/fixtureExportUtils';

const GamesManagement = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading, isAuthenticated } = useAuth();
  
  // Filter states
  const [selectedLeague, setSelectedLeague] = useState('all');
  const [selectedSeason, setSelectedSeason] = useState('all');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  
  // Data states
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [allFixtures, setAllFixtures] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFixtures, setIsLoadingFixtures] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isMatchSetupModalOpen, setIsMatchSetupModalOpen] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [deletingMatchId, setDeletingMatchId] = useState(null);

  // Check if user has access for editing (admin or staff)
  const userRole = userProfile?.role;
  const canEdit = userRole === 'admin' || userRole === 'staff';

  // Fetch data on mount (public access for viewing)
  useEffect(() => {
    loadLeagues();
    loadTeams();
  }, []);

  // Load fixtures on mount and when filters change
  useEffect(() => {
    loadAllFixtures();
  }, []);

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

  const loadTeams = async () => {
    try {
      const data = await teamService.getAll();
      setTeams(data || []);
    } catch (err) {
      console.error('Error loading teams:', err);
    }
  };

  const loadAllFixtures = async () => {
    setIsLoadingFixtures(true);
    try {
      const data = await matchService.getAll();
      setAllFixtures(data || []);
    } catch (err) {
      console.error('Error loading fixtures:', err);
      setError(err.message || 'Failed to load fixtures');
    } finally {
      setIsLoadingFixtures(false);
    }
  };

  // Apply filters to fixtures
  const filteredFixtures = useMemo(() => {
    let filtered = [...allFixtures];

    // Filter by league
    if (selectedLeague && selectedLeague !== 'all') {
      filtered = filtered.filter(fixture => fixture.leagueId === selectedLeague);
    }

    // Filter by season
    if (selectedSeason && selectedSeason !== 'all') {
      filtered = filtered.filter(fixture => {
        const league = leagues.find(l => l.id === fixture.leagueId);
        return league?.season === selectedSeason;
      });
    }

    // Filter by team
    if (selectedTeam && selectedTeam !== 'all') {
      filtered = filtered.filter(fixture => 
        fixture.homeTeamId === selectedTeam || fixture.awayTeamId === selectedTeam
      );
    }

    // Filter by date range
    if (dateRange.startDate) {
      const startDate = new Date(dateRange.startDate);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(fixture => {
        if (!fixture.scheduledDate) return false;
        const fixtureDate = new Date(fixture.scheduledDate);
        return fixtureDate >= startDate;
      });
    }

    if (dateRange.endDate) {
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(fixture => {
        if (!fixture.scheduledDate) return false;
        const fixtureDate = new Date(fixture.scheduledDate);
        return fixtureDate <= endDate;
      });
    }

    // Sort by date
    filtered.sort((a, b) => {
      const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
      const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
      return dateA - dateB;
    });

    // Group by league
    const grouped = filtered.reduce((acc, fixture) => {
      const leagueId = fixture.leagueId || 'no-league';
      if (!acc[leagueId]) {
        acc[leagueId] = {
          league: fixture.league || { name: 'Unassigned', season: '' },
          fixtures: []
        };
      }
      acc[leagueId].fixtures.push(fixture);
      return acc;
    }, {});

    // Convert to array format and sort by league name
    return Object.values(grouped).sort((a, b) => {
      const nameA = a.league?.name || 'Unassigned';
      const nameB = b.league?.name || 'Unassigned';
      return nameA.localeCompare(nameB);
    });
  }, [allFixtures, selectedLeague, selectedSeason, selectedTeam, dateRange, leagues]);

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

  const handleEditMatch = (matchId) => {
    setEditingMatchId(matchId);
    setIsMatchSetupModalOpen(true);
  };

  const handleDeleteMatch = async (matchId) => {
    if (!window.confirm('Are you sure you want to delete this match? This action cannot be undone.')) {
      return;
    }

    setIsLoadingFixtures(true);
    try {
      await matchService.delete(matchId);
      setSuccess('Match deleted successfully!');
      // Reload fixtures
      await loadAllFixtures();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Error deleting match:', err);
      setError(err.message || 'Failed to delete match');
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsLoadingFixtures(false);
    }
  };

  const handleExportFixtures = async (format) => {
    try {
      // Get filtered fixtures (flatten if grouped by league)
      let fixturesToExport = [];
      if (Array.isArray(filteredFixtures) && filteredFixtures.length > 0) {
        if (filteredFixtures[0]?.league) {
          // Grouped by league
          fixturesToExport = filteredFixtures.flatMap(group => group.fixtures || []);
        } else {
          // Single array
          fixturesToExport = filteredFixtures;
        }
      }

      if (fixturesToExport.length === 0) {
        alert('No fixtures to export. Please adjust your filters.');
        return;
      }

      const leagueName = selectedLeague && selectedLeague !== 'all'
        ? leagues.find(l => l.id === selectedLeague)?.name || 'All Leagues'
        : 'All Leagues';

      switch (format) {
        case 'csv':
          exportFixturesToCSV(fixturesToExport, leagueName);
          break;
        case 'excel':
          await exportFixturesToExcel(fixturesToExport, leagueName);
          break;
        case 'pdf':
          await exportFixturesToPDF(fixturesToExport, leagueName);
          break;
        case 'word':
          exportFixturesToWord(fixturesToExport, leagueName);
          break;
        default:
          alert('Invalid export format');
      }
    } catch (err) {
      console.error('Error exporting fixtures:', err);
      setError(err.message || 'Failed to export fixtures');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleModalClose = () => {
    setIsMatchSetupModalOpen(false);
    setEditingMatchId(null);
  };

  const handleModalSuccess = () => {
    // Reload fixtures after successful create/update
    loadAllFixtures();
  };

  // Breadcrumb items - point to league portal for unauthenticated users
  const breadcrumbItems = useMemo(() => {
    if (isAuthenticated) {
      return [
        { label: 'Dashboard', path: '/admin-dashboard' },
        { label: 'League Information', path: '/games-management' }
      ];
    } else {
      return [
        { label: 'League Portal', path: '/public-league-portal' },
        { label: 'League Information', path: '/games-management' }
      ];
    }
  }, [isAuthenticated]);

  return (
    <>
      <Helmet>
        <title>League Information - TBF Registration System</title>
        <meta name="description" content="View and manage basketball match fixtures, schedules, and results for Tanzania Basketball Federation leagues." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumb items={breadcrumbItems} />
            
            {/* Filter Header */}
            <GamesFilterHeader
              selectedLeague={selectedLeague}
              onLeagueChange={setSelectedLeague}
              selectedSeason={selectedSeason}
              onSeasonChange={setSelectedSeason}
              selectedTeam={selectedTeam}
              onTeamChange={setSelectedTeam}
              dateRange={dateRange}
              onDateRangeChange={setDateRange}
              onExport={canEdit ? handleExportFixtures : null}
              leagues={leagues}
              teams={teams}
            />

            {/* Action Buttons - Only show for authenticated users with edit access */}
            {canEdit && (
              <div className="flex items-center justify-end gap-2 mb-6">
                <Button
                  variant="default"
                  onClick={() => setIsMatchSetupModalOpen(true)}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Match Setup
                </Button>
              </div>
            )}

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

            {/* Fixtures List */}
            {isLoadingFixtures ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={48} className="text-primary animate-spin" />
            </div>
          ) : Array.isArray(filteredFixtures) && filteredFixtures.length > 0 && typeof filteredFixtures[0] === 'object' && filteredFixtures[0].league ? (
            // Grouped by league (all fixtures view)
            <div className="space-y-6">
              {filteredFixtures.map((leagueGroup, index) => (
                <div key={index} className="bg-card border border-border rounded-lg p-6 card-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {leagueGroup.league?.name || 'Unassigned League'}
                      </h3>
                      {leagueGroup.league?.season && (
                        <p className="text-sm text-muted-foreground">{leagueGroup.league.season}</p>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {leagueGroup.fixtures?.length || 0} match{leagueGroup.fixtures?.length !== 1 ? 'es' : ''}
                    </div>
                  </div>

                  <div className="space-y-3">
                    {leagueGroup.fixtures?.map((fixture) => (
                      <div
                        key={fixture.id}
                        className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                      >
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

                          {/* Action Buttons - Only show for authenticated users with edit access */}
                          {canEdit && (
                            <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditMatch(fixture.id)}
                                title="Edit match"
                                className="h-8 w-8 p-0"
                              >
                                <Icon name="Edit" size={16} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteMatch(fixture.id)}
                                title="Delete match"
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              >
                                <Icon name="Trash2" size={16} />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : Array.isArray(filteredFixtures) && filteredFixtures.length > 0 && filteredFixtures[0].fixtures ? (
            // Single league fixtures view (when only one league group)
            filteredFixtures.length === 1 ? (
              <div className="bg-card border border-border rounded-lg p-6 card-shadow">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">
                    {filteredFixtures[0].league?.name || 'Fixtures'}
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    {filteredFixtures[0].fixtures.length} match{filteredFixtures[0].fixtures.length !== 1 ? 'es' : ''}
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredFixtures[0].fixtures.map((fixture) => (
                  <div
                    key={fixture.id}
                    className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
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

                      {/* Action Buttons - Only show for authenticated users with edit access */}
                      {canEdit && (
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditMatch(fixture.id)}
                            title="Edit match"
                            className="h-8 w-8 p-0"
                          >
                            <Icon name="Edit" size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteMatch(fixture.id)}
                            title="Delete match"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          >
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              </div>
            ) : null
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center card-shadow">
              <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Fixtures Found</h3>
              <p className="text-muted-foreground mb-4">
                {selectedLeague && selectedLeague !== 'all'
                  ? 'No fixtures scheduled for the selected filters yet'
                  : 'No fixtures found. Try adjusting your filters.'}
              </p>
              {canEdit && (
                <Button
                  variant="default"
                  onClick={() => setIsMatchSetupModalOpen(true)}
                  iconName="Plus"
                  iconPosition="left"
                >
                  Match Setup
                </Button>
              )}
            </div>
          )}

            {/* Match Setup Modal - Only show for authenticated users with edit access */}
            {canEdit && (
              <MatchSetupModal
                isOpen={isMatchSetupModalOpen}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                matchId={editingMatchId}
              />
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default GamesManagement;

