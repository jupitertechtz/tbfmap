import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const FixtureGenerator = ({ league, onGenerate, onClose }) => {
  const [settings, setSettings] = useState({
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
  const [step, setStep] = useState(1); // 1: Settings, 2: Preview, 3: Confirm

  const dayOptions = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const venueOptions = [
    { value: 'national-stadium', label: 'National Stadium (Capacity: 5000)' },
    { value: 'uhuru-stadium', label: 'Uhuru Stadium (Capacity: 3000)' },
    { value: 'azam-complex', label: 'Azam Complex (Capacity: 2500)' },
    { value: 'dar-arena', label: 'Dar es Salaam Arena (Capacity: 4000)' },
    { value: 'mwanza-stadium', label: 'Mwanza Stadium (Capacity: 2000)' }
  ];

  const mockTeams = [
    "Dar es Salaam Lions", "Mwanza Warriors", "Arusha Eagles", 
    "Dodoma Thunder", "Mbeya Stallions", "Tanga Sharks",
    "Kilimanjaro Giants", "Zanzibar Pirates", "Morogoro Bulls",
    "Iringa Leopards", "Singida Stars", "Tabora Tigers"
  ];

  const handleSettingChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateFixtures = () => {
    setIsGenerating(true);
    
    // Mock fixture generation logic
    setTimeout(() => {
      const fixtures = [];
      const teams = mockTeams?.slice(0, league?.teamCount);
      let matchId = 1;
      
      // Generate round-robin fixtures
      for (let round = 0; round < teams?.length - 1; round++) {
        for (let match = 0; match < teams?.length / 2; match++) {
          const home = teams?.[match];
          const away = teams?.[teams?.length - 1 - match];
          
          if (home && away) {
            fixtures?.push({
              id: matchId++,
              round: round + 1,
              homeTeam: home,
              awayTeam: away,
              date: new Date(Date.now() + (round * 7 + match) * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0],
              time: settings?.timeSlots?.[match % settings?.timeSlots?.length],
              venue: settings?.venues?.[match % settings?.venues?.length] || 'TBD',
              status: 'Scheduled'
            });
          }
        }
        
        // Rotate teams for next round
        teams?.splice(1, 0, teams?.pop());
      }
      
      // Double round-robin if selected
      if (settings?.doubleRoundRobin) {
        const secondRound = fixtures?.map(fixture => ({
          ...fixture,
          id: matchId++,
          round: fixture?.round + teams?.length - 1,
          homeTeam: fixture?.awayTeam,
          awayTeam: fixture?.homeTeam,
          date: new Date(new Date(fixture.date).getTime() + (teams.length - 1) * 7 * 24 * 60 * 60 * 1000)?.toISOString()?.split('T')?.[0]
        }));
        fixtures?.push(...secondRound);
      }
      
      setGeneratedFixtures(fixtures);
      setStep(2);
      setIsGenerating(false);
    }, 2000);
  };

  const handleConfirmGeneration = () => {
    onGenerate(generatedFixtures);
    setStep(3);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-card border border-border rounded-lg modal-shadow w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Icon name="Calendar" size={20} className="text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Generate Fixtures</h2>
              <p className="text-sm text-muted-foreground">{league?.name} - {league?.season}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            iconName="X"
          />
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-border">
          <div className="flex items-center space-x-4">
            {[1, 2, 3]?.map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {stepNum}
                </div>
                <span className={`ml-2 text-sm ${
                  step >= stepNum ? 'text-foreground' : 'text-muted-foreground'
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
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-foreground">Fixture Generation Settings</h3>
              
              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  value={settings?.startDate}
                  onChange={(e) => handleSettingChange('startDate', e?.target?.value)}
                  required
                />
                <Input
                  label="End Date"
                  type="date"
                  value={settings?.endDate}
                  onChange={(e) => handleSettingChange('endDate', e?.target?.value)}
                  required
                />
              </div>

              {/* Match Days */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Match Days</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {dayOptions?.map((day) => (
                    <Checkbox
                      key={day?.value}
                      label={day?.label}
                      checked={settings?.matchDays?.includes(day?.value)}
                      onChange={(e) => {
                        if (e?.target?.checked) {
                          handleSettingChange('matchDays', [...settings?.matchDays, day?.value]);
                        } else {
                          handleSettingChange('matchDays', settings?.matchDays?.filter(d => d !== day?.value));
                        }
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Venues */}
              <Select
                label="Available Venues"
                options={venueOptions}
                value={settings?.venues}
                onChange={(value) => handleSettingChange('venues', value)}
                multiple
                searchable
                placeholder="Select venues"
              />

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Time Slots</label>
                <div className="flex flex-wrap gap-2">
                  {settings?.timeSlots?.map((time, index) => (
                    <div key={index} className="flex items-center space-x-2 bg-muted rounded-md px-3 py-2">
                      <span className="text-sm text-foreground">{time}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSlots = settings?.timeSlots?.filter((_, i) => i !== index);
                          handleSettingChange('timeSlots', newSlots);
                        }}
                        iconName="X"
                        className="w-4 h-4 p-0"
                      />
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const time = prompt('Enter time (HH:MM format):');
                      if (time && /^\d{2}:\d{2}$/?.test(time)) {
                        handleSettingChange('timeSlots', [...settings?.timeSlots, time]);
                      }
                    }}
                    iconName="Plus"
                  >
                    Add Time
                  </Button>
                </div>
              </div>

              {/* Advanced Options */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-foreground">Advanced Options</h4>
                
                <Input
                  label="Minimum Rest Days Between Matches"
                  type="number"
                  value={settings?.restDays}
                  onChange={(e) => handleSettingChange('restDays', parseInt(e?.target?.value))}
                  min="0"
                  max="14"
                />

                <div className="space-y-2">
                  <Checkbox
                    label="Double Round-Robin (Home & Away)"
                    checked={settings?.doubleRoundRobin}
                    onChange={(e) => handleSettingChange('doubleRoundRobin', e?.target?.checked)}
                  />
                  
                  <Checkbox
                    label="Avoid Back-to-Back Matches"
                    checked={settings?.avoidBackToBack}
                    onChange={(e) => handleSettingChange('avoidBackToBack', e?.target?.checked)}
                  />
                  
                  <Checkbox
                    label="Balance Home/Away Distribution"
                    checked={settings?.balanceHomeAway}
                    onChange={(e) => handleSettingChange('balanceHomeAway', e?.target?.checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  onClick={generateFixtures}
                  loading={isGenerating}
                  iconName="Zap"
                  iconPosition="left"
                  disabled={!settings?.startDate || !settings?.endDate || settings?.venues?.length === 0}
                >
                  Generate Fixtures
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-foreground">Fixture Preview</h3>
                <div className="text-sm text-muted-foreground">
                  {generatedFixtures?.length} matches generated
                </div>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  {generatedFixtures?.slice(0, 10)?.map((fixture) => (
                    <div key={fixture?.id} className="flex items-center justify-between bg-card rounded-md p-3 border border-border">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-foreground">
                          Round {fixture?.round}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {fixture?.homeTeam} vs {fixture?.awayTeam}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{fixture?.date}</span>
                        <span>{fixture?.time}</span>
                        <span>{fixture?.venue}</span>
                      </div>
                    </div>
                  ))}
                  {generatedFixtures?.length > 10 && (
                    <div className="text-center text-sm text-muted-foreground">
                      ... and {generatedFixtures?.length - 10} more matches
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  iconName="ChevronLeft"
                  iconPosition="left"
                >
                  Back to Settings
                </Button>
                <Button
                  variant="default"
                  onClick={handleConfirmGeneration}
                  iconName="Check"
                  iconPosition="left"
                >
                  Confirm & Generate
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                <Icon name="CheckCircle" size={32} className="text-success" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Fixtures Generated Successfully!</h3>
                <p className="text-muted-foreground mt-2">
                  {generatedFixtures?.length} matches have been created for {league?.name}
                </p>
              </div>
              <Button
                variant="default"
                onClick={onClose}
                iconName="ArrowRight"
                iconPosition="right"
              >
                Continue to League Management
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FixtureGenerator;