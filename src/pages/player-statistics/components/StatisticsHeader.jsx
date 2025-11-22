import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const StatisticsHeader = ({ 
  searchTerm, 
  onSearchChange, 
  selectedSeason, 
  onSeasonChange, 
  selectedTeam, 
  onTeamChange,
  onExport,
  teams = [],
  leagues = []
}) => {
  const [exportFormat, setExportFormat] = useState('pdf');

  // Generate season options from leagues
  const seasonOptions = React.useMemo(() => {
    const options = [{ value: 'career', label: 'Career Stats' }];
    
    if (leagues && leagues.length > 0) {
      // Get unique seasons from leagues
      const uniqueSeasons = [...new Set(leagues.map(league => league.season).filter(Boolean))];
      uniqueSeasons.sort().reverse(); // Most recent first
      
      uniqueSeasons.forEach(season => {
        options.push({ value: season, label: `${season} Season` });
      });
    } else {
      // Fallback options if no leagues
      options.push(
        { value: '2024-25', label: '2024-25 Season' },
        { value: '2023-24', label: '2023-24 Season' },
        { value: '2022-23', label: '2022-23 Season' }
      );
    }
    
    return options;
  }, [leagues]);

  // Generate team options from teams data
  const teamOptions = React.useMemo(() => {
    const options = [{ value: 'all', label: 'All Teams' }];
    
    if (teams && teams.length > 0) {
      teams.forEach(team => {
        options.push({ value: team.id, label: team.name || team.shortName });
      });
    } else {
      // Fallback options if no teams
      options.push(
        { value: 'simba', label: 'Simba Basketball Club' },
        { value: 'yanga', label: 'Young Africans SC' },
        { value: 'azam', label: 'Azam Basketball' }
      );
    }
    
    return options;
  }, [teams]);

  const handleExport = () => {
    onExport(exportFormat);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 card-shadow mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title and Description */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground mb-2">Player Statistics</h1>
          <p className="text-muted-foreground">
            Comprehensive performance analytics and comparison tools for basketball players
          </p>
        </div>

        {/* Export Actions */}
        <div className="flex items-center space-x-2">
          <Select
            options={[
              { value: 'pdf', label: 'PDF Report' },
              { value: 'excel', label: 'Excel Spreadsheet' },
              { value: 'csv', label: 'CSV Data' }
            ]}
            value={exportFormat}
            onChange={setExportFormat}
            className="w-40"
          />
          <Button
            variant="outline"
            onClick={handleExport}
            iconName="Download"
            iconPosition="left"
          >
            Export
          </Button>
        </div>
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <Input
          type="search"
          placeholder="Search players..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e?.target?.value)}
          className="w-full"
        />
        
        <Select
          label="Season"
          options={seasonOptions}
          value={selectedSeason}
          onChange={onSeasonChange}
        />
        
        <Select
          label="Team"
          options={teamOptions}
          value={selectedTeam}
          onChange={onTeamChange}
        />
      </div>
    </div>
  );
};

export default StatisticsHeader;