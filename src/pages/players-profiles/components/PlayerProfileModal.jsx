import React, { useEffect, useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';
import { playerService } from '../../../services/playerService';

const PlayerProfileModal = ({ player, isOpen, onClose }) => {
  const [playerDetails, setPlayerDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && player?.id) {
      loadPlayerDetails();
    } else {
      setPlayerDetails(null);
      setError(null);
    }
  }, [isOpen, player?.id]);

  const loadPlayerDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const details = await playerService.getById(player.id);
      setPlayerDetails(details);
    } catch (err) {
      console.error('Failed to load player details:', err);
      setError(err?.message || 'Failed to load player details');
      // Fallback to basic player data if detailed fetch fails
      setPlayerDetails(player);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const formatHeight = (cm) => {
    if (!cm) return 'N/A';
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm / 2.54) - (feet * 12));
    return `${feet}'${inches}" (${cm} cm)`;
  };

  const getPositionLabel = (position) => {
    const positions = {
      point_guard: 'Point Guard',
      shooting_guard: 'Shooting Guard',
      small_forward: 'Small Forward',
      power_forward: 'Power Forward',
      center: 'Center'
    };
    return positions[position] || position?.replace('_', ' ') || 'N/A';
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      active: 'bg-success/10 text-success border-success/20',
      injured: 'bg-warning/10 text-warning border-warning/20',
      suspended: 'bg-error/10 text-error border-error/20',
      inactive: 'bg-muted text-muted-foreground border-border',
      transferred: 'bg-muted text-muted-foreground border-border'
    };
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${
        statusStyles[status] || statusStyles.inactive
      }`}>
        {status?.charAt(0)?.toUpperCase() + status?.slice(1) || 'Unknown'}
      </span>
    );
  };

  if (!isOpen) return null;

  const displayPlayer = playerDetails || player;
  const playerPhotoUrl = playerService.getPlayerPhotoUrl(displayPlayer);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto card-shadow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
              <Image
                src={playerPhotoUrl}
                alt={displayPlayer?.userProfile?.fullName || 'Player'}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {displayPlayer?.userProfile?.fullName || 'Unknown Player'}
              </h2>
              {displayPlayer?.jerseyNumber && (
                <p className="text-muted-foreground">#{displayPlayer.jerseyNumber}</p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="flex-shrink-0"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={48} className="text-primary animate-spin" />
            </div>
          ) : error && !playerDetails ? (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-muted/30 border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="User" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Full Name</p>
                    <p className="font-medium text-foreground">
                      {displayPlayer?.userProfile?.fullName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">
                      {displayPlayer?.userProfile?.email || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">
                      {displayPlayer?.userProfile?.phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium text-foreground">
                      {formatDate(displayPlayer?.dateOfBirth)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Place of Birth</p>
                    <p className="font-medium text-foreground">
                      {displayPlayer?.placeOfBirth || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Nationality</p>
                    <p className="font-medium text-foreground">
                      {displayPlayer?.nationality || 'N/A'}
                    </p>
                  </div>
                <div>
                  <p className="text-sm text-muted-foreground">Player License Number</p>
                  <p className="font-medium text-foreground">
                    {displayPlayer?.licenseNumber || 'N/A'}
                  </p>
                </div>
                </div>
              </div>

              {/* Team & Position */}
              <div className="bg-muted/30 border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Users" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Team & Position</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Team</p>
                    <p className="font-medium text-foreground">
                      {displayPlayer?.team?.name || 'No Team Assigned'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Position</p>
                    <p className="font-medium text-foreground">
                      {getPositionLabel(displayPlayer?.playerPosition)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">
                      {getStatusBadge(displayPlayer?.playerStatus)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Physical Attributes */}
              <div className="bg-muted/30 border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Ruler" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Physical Attributes</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Height</p>
                    <p className="font-medium text-foreground">
                      {formatHeight(displayPlayer?.heightCm)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Weight</p>
                    <p className="font-medium text-foreground">
                      {displayPlayer?.weightKg ? `${displayPlayer.weightKg} kg` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Medical Information */}
              {(displayPlayer?.emergencyContactName || displayPlayer?.emergencyContactPhone || displayPlayer?.medicalConditions) && (
                <div className="bg-muted/30 border border-border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="Heart" size={20} className="text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Medical Information</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {displayPlayer?.emergencyContactName && (
                      <div>
                        <p className="text-sm text-muted-foreground">Emergency Contact</p>
                        <p className="font-medium text-foreground">
                          {displayPlayer.emergencyContactName}
                        </p>
                        {displayPlayer?.emergencyContactPhone && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {displayPlayer.emergencyContactPhone}
                          </p>
                        )}
                      </div>
                    )}
                    {displayPlayer?.medicalConditions && (
                      <div>
                        <p className="text-sm text-muted-foreground">Medical Conditions</p>
                        <p className="font-medium text-foreground">
                          {Array.isArray(displayPlayer.medicalConditions) 
                            ? displayPlayer.medicalConditions.join(', ')
                            : displayPlayer.medicalConditions}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Statistics */}
              {playerDetails?.statistics && playerDetails.statistics.length > 0 && (
                <div className="bg-muted/30 border border-border rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Icon name="BarChart3" size={20} className="text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">Statistics</h3>
                  </div>
                  <div className="space-y-4">
                    {playerDetails.statistics.map((stat) => (
                      <div key={stat.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-foreground">
                            {stat.league?.name || 'Overall'} - {stat.league?.season || ''}
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            {stat.gamesPlayed || 0} Games
                          </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Points</p>
                            <p className="font-semibold text-foreground">{stat.points || 0}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Rebounds</p>
                            <p className="font-semibold text-foreground">{stat.rebounds || 0}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Assists</p>
                            <p className="font-semibold text-foreground">{stat.assists || 0}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Steals</p>
                            <p className="font-semibold text-foreground">{stat.steals || 0}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Registration Info */}
              <div className="bg-muted/30 border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="FileText" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Registration Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Status</p>
                    <p className="font-medium text-foreground">
                      {displayPlayer?.registrationStatus || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Registration Date</p>
                    <p className="font-medium text-foreground">
                      {formatDate(displayPlayer?.registrationDate)}
                    </p>
                  </div>
                  {displayPlayer?.approvedDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Approved Date</p>
                      <p className="font-medium text-foreground">
                        {formatDate(displayPlayer.approvedDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border px-6 py-4 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PlayerProfileModal;

