import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { teamService } from '../../../services/teamService';

const RearrangeFixtureForm = ({ fixture, leagueDetails, onSave, onCancel, isSaving }) => {
  const [formData, setFormData] = useState({
    scheduledDate: '',
    scheduledTime: '',
    venue: '',
    homeTeamId: '',
    awayTeamId: ''
  });
  const [availableTeams, setAvailableTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);

  useEffect(() => {
    if (fixture) {
      const date = fixture.scheduledDate ? new Date(fixture.scheduledDate) : new Date();
      setFormData({
        scheduledDate: date.toISOString().split('T')[0],
        scheduledTime: date.toTimeString().slice(0, 5),
        venue: fixture.venue || '',
        homeTeamId: fixture.homeTeamId || '',
        awayTeamId: fixture.awayTeamId || ''
      });
    }

    // Load available teams
    const loadTeams = async () => {
      setIsLoadingTeams(true);
      try {
        const teams = await teamService.getAll();
        setAvailableTeams(teams || []);
      } catch (err) {
        console.error('Error loading teams:', err);
      } finally {
        setIsLoadingTeams(false);
      }
    };
    loadTeams();
  }, [fixture]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`);
    const scheduledDate = dateTime.toISOString();

    onSave({
      scheduledDate,
      venue: formData.venue,
      homeTeamId: formData.homeTeamId || fixture.homeTeamId,
      awayTeamId: formData.awayTeamId || fixture.awayTeamId
    });
  };

  const teamOptions = availableTeams.map(team => ({
    value: team.id,
    label: team.name
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          value={formData.scheduledDate}
          onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
          required
        />
        <Input
          label="Time"
          type="time"
          value={formData.scheduledTime}
          onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
          required
        />
      </div>

      <Input
        label="Venue"
        placeholder="Enter venue name"
        value={formData.venue}
        onChange={(e) => setFormData(prev => ({ ...prev, venue: e.target.value }))}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Home Team"
          value={formData.homeTeamId}
          onChange={(value) => setFormData(prev => ({ ...prev, homeTeamId: value }))}
          options={teamOptions}
          placeholder="Select home team"
          disabled={isLoadingTeams}
        />
        <Select
          label="Away Team"
          value={formData.awayTeamId}
          onChange={(value) => setFormData(prev => ({ ...prev, awayTeamId: value }))}
          options={teamOptions}
          placeholder="Select away team"
          disabled={isLoadingTeams}
        />
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="default"
          loading={isSaving}
          iconName="Save"
          iconPosition="left"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default RearrangeFixtureForm;

