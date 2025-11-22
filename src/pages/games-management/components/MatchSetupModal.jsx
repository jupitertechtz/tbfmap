import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { leagueService } from '../../../services/leagueService';
import { teamService } from '../../../services/teamService';
import { officialService } from '../../../services/officialService';
import { matchService } from '../../../services/matchService';
import Image from '../../../components/AppImage';

const MatchSetupModal = ({ isOpen, onClose, onSuccess, matchId = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Data states
  const [leagues, setLeagues] = useState([]);
  const [teams, setTeams] = useState([]);
  const [officials, setOfficials] = useState([]);

  // Form states
  const [formData, setFormData] = useState({
    leagueId: '',
    homeTeamId: '',
    awayTeamId: '',
    scheduledDate: '',
    scheduledTime: '',
    venue: '',
    refereeId: '',
    umpire1Id: '',
    umpire2Id: '',
    tableOfficialId: '',
    commissionerId: '',
    matchNotes: ''
  });

  const isEditMode = !!matchId;

  // Load data on mount
  useEffect(() => {
    if (isOpen) {
      loadData();
      if (isEditMode && matchId) {
        loadMatchData();
      }
    }
  }, [isOpen, matchId]);

  const loadMatchData = async () => {
    setIsLoading(true);
    try {
      const match = await matchService.getById(matchId);
      if (match) {
        const scheduledDate = match.scheduledDate ? new Date(match.scheduledDate) : null;
        setFormData({
          leagueId: match.leagueId || '',
          homeTeamId: match.homeTeamId || '',
          awayTeamId: match.awayTeamId || '',
          scheduledDate: scheduledDate ? scheduledDate.toISOString().split('T')[0] : '',
          scheduledTime: scheduledDate ? scheduledDate.toTimeString().slice(0, 5) : '',
          venue: match.venue || '',
          refereeId: match.refereeId || '',
          umpire1Id: match.umpire1Id || '',
          umpire2Id: match.umpire2Id || '',
          tableOfficialId: '', // Not stored in matches table
          commissionerId: '', // Not stored in matches table
          matchNotes: match.matchNotes || ''
        });
      }
    } catch (err) {
      console.error('Error loading match data:', err);
      setError(err.message || 'Failed to load match data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [leaguesData, teamsData, officialsData] = await Promise.all([
        leagueService.getAll(),
        teamService.getAll(),
        officialService.getAll()
      ]);
      setLeagues(leaguesData || []);
      setTeams(teamsData || []);
      setOfficials(officialsData || []);
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.leagueId) {
      setError('Please select a league');
      return;
    }
    if (!formData.homeTeamId || !formData.awayTeamId) {
      setError('Please select both home and away teams');
      return;
    }
    if (formData.homeTeamId === formData.awayTeamId) {
      setError('Home and away teams must be different');
      return;
    }
    if (!formData.scheduledDate || !formData.scheduledTime) {
      setError('Please select date and time');
      return;
    }
    if (!formData.venue) {
      setError('Please enter a venue');
      return;
    }

    setIsLoading(true);
    try {
      // Combine date and time
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
      
      const matchData = {
        leagueId: formData.leagueId,
        homeTeamId: formData.homeTeamId,
        awayTeamId: formData.awayTeamId,
        scheduledDate: scheduledDateTime.toISOString(),
        venue: formData.venue,
        refereeId: formData.refereeId || null,
        umpire1Id: formData.umpire1Id || null,
        umpire2Id: formData.umpire2Id || null,
        matchNotes: formData.matchNotes || null
      };

      if (isEditMode) {
        await matchService.update(matchId, matchData);
        setSuccess('Match updated successfully!');
      } else {
        await matchService.create(matchData);
        setSuccess('Match created successfully!');
      }
      
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} match:`, err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} match`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      leagueId: '',
      homeTeamId: '',
      awayTeamId: '',
      scheduledDate: '',
      scheduledTime: '',
      venue: '',
      refereeId: '',
      umpire1Id: '',
      umpire2Id: '',
      tableOfficialId: '',
      commissionerId: '',
      matchNotes: ''
    });
    setError(null);
    setSuccess(null);
    onClose();
  };

  // Filter officials by specialization
  const getReferees = () => {
    return officials.filter(o => o.specialization === 'Referee' && o.isAvailable);
  };

  const getTableOfficials = () => {
    return officials.filter(o => o.specialization === 'Table Official' && o.isAvailable);
  };

  const getCommissioners = () => {
    return officials.filter(o => o.specialization === 'Commissioner' && o.isAvailable);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg modal-shadow w-full max-w-4xl max-h-[90vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {isEditMode ? 'Edit Match' : 'Match Setup'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isEditMode ? 'Update match information and assign officials' : 'Create a new match and assign officials'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            iconName="X"
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-180px)] p-6">
          {isLoading && !formData.leagueId ? (
            <div className="flex items-center justify-center py-12">
              <Icon name="Loader2" size={48} className="text-primary animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error/Success Messages */}
              {error && (
                <div className="px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
                  <div className="flex items-start gap-3">
                    <Icon name="AlertTriangle" size={18} />
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="px-4 py-3 rounded-lg border bg-success/10 border-success/20 text-success">
                  <div className="flex items-start gap-3">
                    <Icon name="CheckCircle2" size={18} />
                    <p className="font-medium">{success}</p>
                  </div>
                </div>
              )}

              {/* Match Details */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Match Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* League */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      League <span className="text-destructive">*</span>
                    </label>
                    <Select
                      options={leagues.map(league => ({
                        value: league.id,
                        label: `${league.name} - ${league.season}`
                      }))}
                      value={formData.leagueId}
                      onChange={(value) => handleChange('leagueId', value)}
                      placeholder="Select league"
                      searchable
                      disabled={isEditMode}
                    />
                  </div>

                  {/* Venue */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Venue <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      value={formData.venue}
                      onChange={(e) => handleChange('venue', e.target.value)}
                      placeholder="Enter venue name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Home Team */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Home Team <span className="text-destructive">*</span>
                    </label>
                    <Select
                      options={teams
                        .filter(team => team.id !== formData.awayTeamId)
                        .map(team => ({
                          value: team.id,
                          label: team.name,
                          description: team.shortName
                        }))}
                      value={formData.homeTeamId}
                      onChange={(value) => handleChange('homeTeamId', value)}
                      placeholder="Select home team"
                      searchable
                      disabled={isEditMode}
                    />
                  </div>

                  {/* Away Team */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Away Team <span className="text-destructive">*</span>
                    </label>
                    <Select
                      options={teams
                        .filter(team => team.id !== formData.homeTeamId)
                        .map(team => ({
                          value: team.id,
                          label: team.name,
                          description: team.shortName
                        }))}
                      value={formData.awayTeamId}
                      onChange={(value) => handleChange('awayTeamId', value)}
                      placeholder="Select away team"
                      searchable
                      disabled={isEditMode}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Scheduled Date */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Date <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => handleChange('scheduledDate', e.target.value)}
                    />
                  </div>

                  {/* Scheduled Time */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Time <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => handleChange('scheduledTime', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Game Officials */}
              <div className="space-y-4 pt-4 border-t border-border">
                <h3 className="text-lg font-semibold text-foreground">Game Officials</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Main Referee */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Main Referee
                    </label>
                    <Select
                      options={getReferees().map(official => ({
                        value: official.userProfileId,
                        label: official.userProfile?.fullName || 'Unknown',
                        description: `${official.certificationLevel} - ${official.experienceYears} years`
                      }))}
                      value={formData.refereeId}
                      onChange={(value) => handleChange('refereeId', value)}
                      placeholder="Select main referee"
                      searchable
                    />
                  </div>

                  {/* Umpire 1 */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Umpire 1
                    </label>
                    <Select
                      options={getReferees()
                        .filter(o => o.userProfileId !== formData.refereeId)
                        .map(official => ({
                          value: official.userProfileId,
                          label: official.userProfile?.fullName || 'Unknown',
                          description: `${official.certificationLevel} - ${official.experienceYears} years`
                        }))}
                      value={formData.umpire1Id}
                      onChange={(value) => handleChange('umpire1Id', value)}
                      placeholder="Select umpire 1"
                      searchable
                    />
                  </div>

                  {/* Umpire 2 */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Umpire 2
                    </label>
                    <Select
                      options={getReferees()
                        .filter(o => o.userProfileId !== formData.refereeId && o.userProfileId !== formData.umpire1Id)
                        .map(official => ({
                          value: official.userProfileId,
                          label: official.userProfile?.fullName || 'Unknown',
                          description: `${official.certificationLevel} - ${official.experienceYears} years`
                        }))}
                      value={formData.umpire2Id}
                      onChange={(value) => handleChange('umpire2Id', value)}
                      placeholder="Select umpire 2"
                      searchable
                    />
                  </div>

                  {/* Table Official */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Table Official
                    </label>
                    <Select
                      options={getTableOfficials().map(official => ({
                        value: official.userProfileId,
                        label: official.userProfile?.fullName || 'Unknown',
                        description: `${official.certificationLevel} - ${official.experienceYears} years`
                      }))}
                      value={formData.tableOfficialId}
                      onChange={(value) => handleChange('tableOfficialId', value)}
                      placeholder="Select table official"
                      searchable
                    />
                  </div>
                </div>

                {/* Commissioner */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Commissioner
                  </label>
                  <Select
                    options={getCommissioners().map(official => ({
                      value: official.userProfileId,
                      label: official.userProfile?.fullName || 'Unknown',
                      description: `${official.certificationLevel} - ${official.experienceYears} years`
                    }))}
                    value={formData.commissionerId}
                    onChange={(value) => handleChange('commissionerId', value)}
                    placeholder="Select commissioner"
                    searchable
                  />
                </div>
              </div>

              {/* Match Notes */}
              <div className="pt-4 border-t border-border">
                <label className="block text-sm font-medium text-foreground mb-2">
                  Match Notes
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  value={formData.matchNotes}
                  onChange={(e) => handleChange('matchNotes', e.target.value)}
                  placeholder="Enter any additional notes or instructions..."
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  disabled={isLoading}
                  iconName={isLoading ? "Loader2" : "Save"}
                  iconPosition="left"
                >
                  {isLoading 
                    ? (isEditMode ? 'Updating...' : 'Creating...') 
                    : (isEditMode ? 'Update Match' : 'Create Match')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchSetupModal;

