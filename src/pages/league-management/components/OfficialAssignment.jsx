import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';
import { matchService } from '../../../services/matchService';

const OfficialAssignment = ({ matches = [], officials = [], onAssign, onClose }) => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [assignments, setAssignments] = useState({});
  const [filter, setFilter] = useState('all');

  // Transform matches data for display
  const transformedMatches = matches.map(match => {
    const scheduledDate = match.scheduledDate ? new Date(match.scheduledDate) : null;
    const hasReferee = !!match.refereeId;
    const hasUmpire1 = !!match.umpire1Id;
    const hasUmpire2 = !!match.umpire2Id;
    const hasAllOfficials = hasReferee && hasUmpire1 && hasUmpire2;
    
    let status = 'Needs Officials';
    if (hasAllOfficials) {
      status = 'Fully Assigned';
    } else if (hasReferee || hasUmpire1 || hasUmpire2) {
      status = 'Partially Assigned';
    }

    return {
      id: match.id,
      homeTeam: match.homeTeam?.name || 'TBD',
      awayTeam: match.awayTeam?.name || 'TBD',
      date: scheduledDate ? scheduledDate.toISOString().split('T')[0] : '',
      time: scheduledDate ? scheduledDate.toTimeString().slice(0, 5) : '',
      venue: match.venue || 'TBD',
      status: status,
      matchStatus: match.matchStatus,
      requiredOfficials: {
        referee1: match.refereeId,
        referee2: match.umpire1Id,
        umpire2: match.umpire2Id,
        tableOfficial: null, // Not stored in matches table
        commissioner: null // Not stored in matches table
      },
      // Store original match data
      originalMatch: match
    };
  });

  // Transform officials data for display
  const transformedOfficials = officials.map(official => ({
    id: official.userProfileId || official.id,
    name: official.userProfile?.fullName || 'Unknown',
    role: official.specialization || 'Unknown',
    level: official.certificationLevel || 'N/A',
    experience: `${official.experienceYears || 0} years`,
    availability: official.isAvailable ? 'Available' : 'Busy',
    avatar: official.photoUrl || official.userProfile?.avatarUrl || '/assets/images/no_image.png',
    avatarAlt: `${official.userProfile?.fullName || 'Official'} photo`,
    contact: official.userProfile?.phone || 'N/A',
    assignedMatches: 0 // Could be calculated from matches
  }));



  const filterOptions = [
  { value: 'all', label: 'All Matches' },
  { value: 'needs-officials', label: 'Needs Officials' },
  { value: 'partially-assigned', label: 'Partially Assigned' },
  { value: 'fully-assigned', label: 'Fully Assigned' }];


  const getStatusColor = (status) => {
    switch (status) {
      case 'Needs Officials':
        return 'bg-error/10 text-error border-error/20';
      case 'Partially Assigned':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'Fully Assigned':
        return 'bg-success/10 text-success border-success/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getAvailabilityColor = (availability) => {
    switch (availability) {
      case 'Available':
        return 'bg-success/10 text-success';
      case 'Busy':
        return 'bg-error/10 text-error';
      case 'Limited':
        return 'bg-warning/10 text-warning';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredMatches = transformedMatches?.filter((match) => {
    if (filter === 'all') return true;
    if (filter === 'needs-officials') return match?.status === 'Needs Officials';
    if (filter === 'partially-assigned') return match?.status === 'Partially Assigned';
    if (filter === 'fully-assigned') return match?.status === 'Fully Assigned';
    return true;
  });

  const getAvailableOfficials = (role) => {
    return transformedOfficials?.filter((official) =>
      official?.role === role && official?.availability === 'Available'
    );
  };

  const handleAssignOfficial = (matchId, position, officialId) => {
    const official = transformedOfficials?.find((o) => o?.id === officialId || o?.id?.toString() === officialId?.toString());
    if (official) {
      setAssignments((prev) => ({
        ...prev,
        [`${matchId}-${position}`]: official
      }));
    }
  };

  const handleSaveAssignments = async () => {
    try {
      // Process assignments and update matches
      const updates = [];
      for (const [key, official] of Object.entries(assignments)) {
        const [matchId, position] = key.split('-');
        const match = transformedMatches.find(m => m.id === matchId);
        if (match && match.originalMatch) {
          const updateData = {};
          if (position === 'referee1') {
            updateData.refereeId = official.id;
          } else if (position === 'referee2') {
            updateData.umpire1Id = official.id;
          } else if (position === 'umpire2') {
            updateData.umpire2Id = official.id;
          }
          if (Object.keys(updateData).length > 0) {
            updates.push({ matchId: match.originalMatch.id, ...updateData });
          }
        }
      }
      
      // Call onAssign with updates
      await onAssign(updates);
      onClose();
    } catch (error) {
      console.error('Error saving assignments:', error);
      alert('Failed to save assignments. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg modal-shadow w-full max-w-6xl max-h-[90vh] overflow-hidden m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Official Assignment</h2>
              <p className="text-sm text-muted-foreground">Assign referees and officials to matches</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X" />

        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Panel - Matches */}
          <div className="w-1/2 border-r border-border">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">Matches</h3>
                <Select
                  options={filterOptions}
                  value={filter}
                  onChange={setFilter}
                  placeholder="Filter matches"
                  className="w-48" />

              </div>
            </div>

            <div className="overflow-y-auto h-full p-4 space-y-3">
              {filteredMatches?.map((match) =>
              <div
                key={match?.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all micro-interaction ${
                selectedMatch?.id === match?.id ?
                'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`
                }
                onClick={() => setSelectedMatch(match)}>

                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-foreground">
                      {match?.homeTeam} vs {match?.awayTeam}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(match?.status)}`}>
                      {match?.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Icon name="Calendar" size={14} />
                      <span>{match?.date}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="Clock" size={14} />
                      <span>{match?.time}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Icon name="MapPin" size={14} />
                      <span>{match?.venue}</span>
                    </div>
                  </div>

                  {/* Assignment Status */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className={`p-2 rounded ${match?.requiredOfficials?.referee1 ? 'bg-success/10' : 'bg-muted'}`}>
                      <div className="font-medium">Referee 1</div>
                      <div className="text-muted-foreground">
                        {match?.requiredOfficials?.referee1 || 'Not Assigned'}
                      </div>
                    </div>
                    <div className={`p-2 rounded ${match?.requiredOfficials?.referee2 ? 'bg-success/10' : 'bg-muted'}`}>
                      <div className="font-medium">Referee 2</div>
                      <div className="text-muted-foreground">
                        {match?.requiredOfficials?.referee2 || 'Not Assigned'}
                      </div>
                    </div>
                    <div className={`p-2 rounded ${match?.requiredOfficials?.tableOfficial ? 'bg-success/10' : 'bg-muted'}`}>
                      <div className="font-medium">Table Official</div>
                      <div className="text-muted-foreground">
                        {match?.requiredOfficials?.tableOfficial || 'Not Assigned'}
                      </div>
                    </div>
                    <div className={`p-2 rounded ${match?.requiredOfficials?.commissioner ? 'bg-success/10' : 'bg-muted'}`}>
                      <div className="font-medium">Commissioner</div>
                      <div className="text-muted-foreground">
                        {match?.requiredOfficials?.commissioner || 'Not Assigned'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Assignment */}
          <div className="w-1/2">
            {selectedMatch ?
            <div className="h-full flex flex-col">
                <div className="p-4 border-b border-border">
                  <h3 className="text-lg font-medium text-foreground">Assign Officials</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Referee 1 */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Referee 1 (Main)
                    </label>
                    <Select
                    options={getAvailableOfficials('Referee')?.map((official) => ({
                      value: official?.id?.toString(),
                      label: `${official?.name} (${official?.level})`,
                      description: `${official?.experience} - ${official?.availability}`
                    }))}
                    value={assignments?.[`${selectedMatch?.id}-referee1`]?.id?.toString() || ''}
                    onChange={(value) => handleAssignOfficial(selectedMatch?.id, 'referee1', value)}
                    placeholder="Select referee"
                    searchable />

                  </div>

                  {/* Referee 2 */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Referee 2 (Assistant)
                    </label>
                    <Select
                    options={getAvailableOfficials('Referee')?.map((official) => ({
                      value: official?.id?.toString(),
                      label: `${official?.name} (${official?.level})`,
                      description: `${official?.experience} - ${official?.availability}`
                    }))}
                    value={assignments?.[`${selectedMatch?.id}-referee2`]?.id?.toString() || ''}
                    onChange={(value) => handleAssignOfficial(selectedMatch?.id, 'referee2', value)}
                    placeholder="Select referee"
                    searchable />

                  </div>

                  {/* Table Official */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Table Official
                    </label>
                    <Select
                    options={getAvailableOfficials('Table Official')?.map((official) => ({
                      value: official?.id?.toString(),
                      label: `${official?.name} (${official?.level})`,
                      description: `${official?.experience} - ${official?.availability}`
                    }))}
                    value={assignments?.[`${selectedMatch?.id}-tableOfficial`]?.id?.toString() || ''}
                    onChange={(value) => handleAssignOfficial(selectedMatch?.id, 'tableOfficial', value)}
                    placeholder="Select table official"
                    searchable />

                  </div>

                  {/* Commissioner */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Commissioner
                    </label>
                    <Select
                    options={getAvailableOfficials('Commissioner')?.map((official) => ({
                      value: official?.id?.toString(),
                      label: `${official?.name} (${official?.level})`,
                      description: `${official?.experience} - ${official?.availability}`
                    }))}
                    value={assignments?.[`${selectedMatch?.id}-commissioner`]?.id?.toString() || ''}
                    onChange={(value) => handleAssignOfficial(selectedMatch?.id, 'commissioner', value)}
                    placeholder="Select commissioner"
                    searchable />

                  </div>

                  {/* Available Officials List */}
                  <div>
                    <h4 className="text-md font-medium text-foreground mb-3">Available Officials</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {transformedOfficials?.map((official) =>
                    <div key={official?.id} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                          <Image
                        src={official?.avatar}
                        alt={official?.avatarAlt}
                        className="w-10 h-10 rounded-full object-cover" />

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="text-sm font-medium text-foreground">{official?.name}</p>
                              <span className={`px-2 py-1 rounded-full text-xs ${getAvailabilityColor(official?.availability)}`}>
                                {official?.availability}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {official?.role} • {official?.level} • {official?.assignedMatches} matches
                            </p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {official?.experience}
                          </div>
                        </div>
                    )}
                    </div>
                  </div>
                </div>
              </div> :

            <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Select a Match</h3>
                  <p className="text-sm text-muted-foreground">
                    Choose a match from the left panel to assign officials
                  </p>
                </div>
              </div>
            }
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <div className="text-sm text-muted-foreground">
            {Object.keys(assignments)?.length} assignments pending
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={onClose}>

              Cancel
            </Button>
            <Button
              variant="default"
              onClick={handleSaveAssignments}
              iconName="Save"
              iconPosition="left"
              disabled={Object.keys(assignments)?.length === 0}>

              Save Assignments
            </Button>
          </div>
        </div>
      </div>
    </div>);

};

export default OfficialAssignment;