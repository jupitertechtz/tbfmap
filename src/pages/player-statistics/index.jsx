import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Breadcrumb from '../../components/ui/Breadcrumb';
import StatisticsHeader from './components/StatisticsHeader';
import PlayerStatsCard from './components/PlayerStatsCard';
import ComparisonPanel from './components/ComparisonPanel';
import LeaderboardSection from './components/LeaderboardSection';
import PerformanceChart from './components/PerformanceChart';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Image from '../../components/AppImage';
import { playerService } from '../../services/playerService';
import { teamService } from '../../services/teamService';
import { leagueService } from '../../services/leagueService';
import { exportToCSV, exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { useAuth } from '../../contexts/AuthContext';
import PlayerProfileModal from '../players-profiles/components/PlayerProfileModal';

const PlayerStatistics = () => {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeason, setSelectedSeason] = useState('career');
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [selectedPlayerForChart, setSelectedPlayerForChart] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('points');
  const [currentPage, setCurrentPage] = useState(1);
  const playersPerPage = 12;
  
  // Modal states
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageAlt, setSelectedImageAlt] = useState('');
  const [playerDetailsModalOpen, setPlayerDetailsModalOpen] = useState(false);
  const [selectedPlayerForDetails, setSelectedPlayerForDetails] = useState(null);
  
  // Data states
  const [playersData, setPlayersData] = useState([]);
  const [teams, setTeams] = useState([]);
  const [leagues, setLeagues] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Breadcrumb items - point to league portal for unauthenticated users
  const breadcrumbItems = useMemo(() => {
    if (isAuthenticated) {
      // Authenticated users see dashboard link
      return [
        { label: 'Dashboard', path: '/admin-dashboard' },
        { label: 'Player Statistics', path: '/player-statistics' }
      ];
    } else {
      // Unauthenticated visitors see league portal link
      return [
        { label: 'League Portal', path: '/public-league-portal' },
        { label: 'Player Statistics', path: '/player-statistics' }
      ];
    }
  }, [isAuthenticated]);

  // Fetch data on mount and when filters change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch teams and leagues in parallel
        const [teamsData, leaguesData] = await Promise.all([
          teamService.getAll(),
          leagueService.getAll()
        ]);
        
        setTeams(teamsData || []);
        setLeagues(leaguesData || []);
        
        // Fetch players with statistics
        const filters = {
          teamId: selectedTeam,
          season: selectedSeason
        };
        
        const playersWithStats = await playerService.getPlayersWithStatistics(filters);
        setPlayersData(playersWithStats || []);
      } catch (err) {
        console.error('Error fetching player statistics:', err);
        setError(err.message || 'Failed to load player statistics');
        setPlayersData([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [selectedSeason, selectedTeam]);


  // Filter and sort players
  const filteredPlayers = useMemo(() => {
    let filtered = playersData?.filter((player) => {
      const matchesSearch = !searchTerm || 
        player?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        player?.team?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
        player?.position?.toLowerCase()?.includes(searchTerm?.toLowerCase());
      return matchesSearch;
    });

    // Sort players
    filtered?.sort((a, b) => {
      switch (sortBy) {
        case 'points':
          return (b?.stats?.pointsPerGame || 0) - (a?.stats?.pointsPerGame || 0);
        case 'rebounds':
          return (b?.stats?.reboundsPerGame || 0) - (a?.stats?.reboundsPerGame || 0);
        case 'assists':
          return (b?.stats?.assistsPerGame || 0) - (a?.stats?.assistsPerGame || 0);
        case 'efficiency':
          return (b?.stats?.efficiency || 0) - (a?.stats?.efficiency || 0);
        case 'name':
          return (a?.name || '').localeCompare(b?.name || '');
        default:
          return (b?.stats?.pointsPerGame || 0) - (a?.stats?.pointsPerGame || 0);
      }
    });

    return filtered;
  }, [playersData, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredPlayers?.length / playersPerPage);
  const currentPlayers = filteredPlayers?.slice(
    (currentPage - 1) * playersPerPage,
    currentPage * playersPerPage
  );

  const handlePlayerCompare = (player) => {
    if (selectedPlayers?.find((p) => p?.id === player?.id)) {
      setSelectedPlayers(selectedPlayers?.filter((p) => p?.id !== player?.id));
    } else if (selectedPlayers?.length < 4) {
      setSelectedPlayers([...selectedPlayers, player]);
    }
  };

  const handleRemoveFromComparison = (playerId) => {
    setSelectedPlayers(selectedPlayers?.filter((p) => p?.id !== playerId));
  };

  const handleClearComparison = () => {
    setSelectedPlayers([]);
  };

  const handlePlayerSelect = (player) => {
    setSelectedPlayerForChart(player);
  };

  const handleImageClick = (imageUrl, imageAlt) => {
    setSelectedImage(imageUrl);
    setSelectedImageAlt(imageAlt);
    setImageModalOpen(true);
  };

  const handleNameClick = async (player) => {
    // Convert player from statistics format to format expected by PlayerProfileModal
    // The statistics page uses a different player structure, so we need to fetch full details
    try {
      // Try to get full player details by ID
      const fullPlayerDetails = await playerService.getById(player.id);
      setSelectedPlayerForDetails(fullPlayerDetails);
    } catch (error) {
      console.error('Failed to load full player details:', error);
      // Fallback: Convert statistics player format to match PlayerProfileModal expected format
      const convertedPlayer = {
        id: player.id,
        userProfileId: player.userProfileId,
        teamId: player.teamId,
        jerseyNumber: player.jerseyNumber,
        playerPosition: player.playerPosition,
        playerStatus: player.playerStatus,
        heightCm: player.heightCm,
        weightKg: player.weightKg,
        dateOfBirth: player.dateOfBirth,
        placeOfBirth: player.placeOfBirth,
        nationality: player.nationality,
        emergencyContactName: player.emergencyContactName,
        emergencyContactPhone: player.emergencyContactPhone,
        medicalConditions: player.medicalConditions,
        userProfile: {
          id: player.userProfileId,
          fullName: player.name,
          email: null,
          phone: null,
          avatarUrl: player.photo
        },
        team: player.team,
        photoUrl: player.photo,
        photoPath: player.photoPath
      };
      setSelectedPlayerForDetails(convertedPlayer);
    }
    setPlayerDetailsModalOpen(true);
  };

  const closeImageModal = () => {
    setImageModalOpen(false);
    setSelectedImage(null);
    setSelectedImageAlt('');
  };

  const closePlayerDetailsModal = () => {
    setPlayerDetailsModalOpen(false);
    setSelectedPlayerForDetails(null);
  };

  const handleExport = async (format) => {
    try {
      const exportData = filteredPlayers || [];
      
      if (exportData.length === 0) {
        alert('No data to export. Please adjust your filters.');
        return;
      }

      const filename = 'player-statistics';
      const filters = {
        season: selectedSeason,
        team: selectedTeam === 'all' ? 'All Teams' : teams.find(t => t.id === selectedTeam)?.name || selectedTeam
      };

      switch (format) {
        case 'csv':
          exportToCSV(exportData, filename);
          break;
        case 'excel':
          await exportToExcel(exportData, filename);
          break;
        case 'pdf':
          await exportToPDF(exportData, filename, filters);
          break;
        default:
          console.warn(`Unknown export format: ${format}`);
          alert(`Export format "${format}" is not supported.`);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
      alert(`Failed to export data: ${error.message}`);
    }
  };

  const sortOptions = [
  { value: 'points', label: 'Points Per Game' },
  { value: 'rebounds', label: 'Rebounds Per Game' },
  { value: 'assists', label: 'Assists Per Game' },
  { value: 'efficiency', label: 'Efficiency Rating' },
  { value: 'name', label: 'Player Name' }];


  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedSeason, selectedTeam, sortBy]);

  return (
    <>
      <Helmet>
        <title>Player Statistics - TBF Registration System</title>
        <meta name="description" content="Comprehensive basketball player statistics, performance analytics, and comparison tools for Tanzania Basketball Federation players." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Breadcrumb items={breadcrumbItems} />
            
            <StatisticsHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedSeason={selectedSeason}
              onSeasonChange={setSelectedSeason}
              selectedTeam={selectedTeam}
              onTeamChange={setSelectedTeam}
              onExport={handleExport}
              teams={teams}
              leagues={leagues} />


            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="xl:col-span-2 space-y-8">
                {/* View Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Button
                        variant={viewMode === 'grid' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('grid')}
                        iconName="Grid3X3" />

                      <Button
                        variant={viewMode === 'list' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                        iconName="List" />

                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {filteredPlayers?.length} players found
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-muted-foreground">Sort by:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e?.target?.value)}
                      className="text-sm border border-border rounded-md px-3 py-1 bg-background text-foreground">

                      {sortOptions?.map((option) =>
                      <option key={option?.value} value={option?.value}>
                          {option?.label}
                        </option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Loading State */}
                {isLoading ? (
                  <div className="bg-card rounded-lg border border-border p-12 card-shadow text-center">
                    <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Loading Statistics</h3>
                    <p className="text-muted-foreground">Fetching player data from database...</p>
                  </div>
                ) : error ? (
                  <div className="bg-card rounded-lg border border-border p-8 card-shadow text-center">
                    <Icon name="AlertTriangle" size={48} className="text-error mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Data</h3>
                    <p className="text-muted-foreground">{error}</p>
                  </div>
                ) : currentPlayers?.length > 0 ? (
                  <div className={viewMode === 'grid' ?
                    "grid grid-cols-1 lg:grid-cols-2 gap-6" : "space-y-4"
                  }>
                    {currentPlayers?.map((player) =>
                      <div key={player?.id}>
                        <PlayerStatsCard
                          player={player}
                          onCompare={handlePlayerCompare}
                          onImageClick={handleImageClick}
                          onNameClick={handleNameClick}
                          isSelected={selectedPlayers?.some((p) => p?.id === player?.id)} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-card rounded-lg border border-border p-8 card-shadow text-center">
                    <Icon name="Search" size={48} className="text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Players Found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search criteria or filters
                    </p>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 &&
                <div className="flex items-center justify-center space-x-2">
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    iconName="ChevronLeft" />

                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10 h-10">

                            {pageNum}
                          </Button>);

                    })}
                    </div>
                    
                    <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    iconName="ChevronRight" />

                  </div>
                }

                {/* Performance Chart */}
                <PerformanceChart selectedPlayer={selectedPlayerForChart} />
              </div>

              {/* Sidebar */}
              <div className="space-y-8">
                <LeaderboardSection 
                  onPlayerSelect={handlePlayerSelect}
                  onImageClick={handleImageClick}
                  onNameClick={handleNameClick}
                  players={filteredPlayers} />
                <ComparisonPanel
                  selectedPlayers={selectedPlayers}
                  onRemovePlayer={handleRemoveFromComparison}
                  onClearAll={handleClearComparison}
                  onImageClick={handleImageClick}
                  onNameClick={handleNameClick} />

              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Image Modal */}
      {imageModalOpen && selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={closeImageModal}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={closeImageModal}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white"
            >
              <Icon name="X" size={24} />
            </Button>
            <Image
              src={selectedImage}
              alt={selectedImageAlt}
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Player Details Modal */}
      {playerDetailsModalOpen && selectedPlayerForDetails && (
        <PlayerProfileModal
          player={selectedPlayerForDetails}
          isOpen={playerDetailsModalOpen}
          onClose={closePlayerDetailsModal}
        />
      )}
    </>);

};

export default PlayerStatistics;