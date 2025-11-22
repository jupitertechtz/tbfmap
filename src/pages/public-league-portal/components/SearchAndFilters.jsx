import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';

const SearchAndFilters = ({ onSearch, onFilterChange, selectedSeason, onSeasonChange }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    team: '',
    venue: ''
  });

  const seasonOptions = [
    { value: '2024-25', label: '2024-25 Season' },
    { value: '2023-24', label: '2023-24 Season' },
    { value: '2022-23', label: '2022-23 Season' },
    { value: '2021-22', label: '2021-22 Season' }
  ];

  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'teams', label: 'Teams' },
    { value: 'players', label: 'Players' },
    { value: 'matches', label: 'Matches' },
    { value: 'news', label: 'News' },
    { value: 'statistics', label: 'Statistics' }
  ];

  const teamOptions = [
    { value: '', label: 'All Teams' },
    { value: 'dar-lions', label: 'Dar es Salaam Lions' },
    { value: 'arusha-eagles', label: 'Arusha Eagles' },
    { value: 'mwanza-warriors', label: 'Mwanza Warriors' },
    { value: 'dodoma-thunder', label: 'Dodoma Thunder' },
    { value: 'mbeya-giants', label: 'Mbeya Giants' },
    { value: 'tanga-sharks', label: 'Tanga Sharks' }
  ];

  const venueOptions = [
    { value: '', label: 'All Venues' },
    { value: 'national-stadium', label: 'National Stadium Arena' },
    { value: 'uhuru-stadium', label: 'Uhuru Stadium Court' },
    { value: 'arusha-sports', label: 'Arusha Sports Complex' },
    { value: 'mwanza-arena', label: 'Mwanza Basketball Arena' },
    { value: 'dodoma-center', label: 'Dodoma Sports Center' }
  ];

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    setSearchQuery(value);
    onSearch(value);
  };

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = { category: '', team: '', venue: '' };
    setFilters(clearedFilters);
    setSearchQuery('');
    onSearch('');
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = searchQuery || Object.values(filters)?.some(value => value !== '');

  return (
    <div className="bg-card rounded-lg border border-border card-shadow mb-6">
      <div className="p-6">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Icon 
                name="Search" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" 
              />
              <Input
                type="search"
                placeholder="Search teams, players, matches, or news..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Season Selector */}
            <Select
              options={seasonOptions}
              value={selectedSeason}
              onChange={onSeasonChange}
              placeholder="Select Season"
              className="w-40"
            />
            
            {/* Filter Toggle */}
            <Button
              variant="outline"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              iconName="Filter"
              iconPosition="left"
              className={isFiltersOpen ? 'bg-primary/10 text-primary border-primary' : ''}
            >
              Filters
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {isFiltersOpen && (
          <div className="border-t border-border pt-4 animate-slide-down">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <Select
                label="Category"
                options={categoryOptions}
                value={filters?.category}
                onChange={(value) => handleFilterChange('category', value)}
                placeholder="All Categories"
              />
              
              <Select
                label="Team"
                options={teamOptions}
                value={filters?.team}
                onChange={(value) => handleFilterChange('team', value)}
                placeholder="All Teams"
                searchable
              />
              
              <Select
                label="Venue"
                options={venueOptions}
                value={filters?.venue}
                onChange={(value) => handleFilterChange('venue', value)}
                placeholder="All Venues"
                searchable
              />
            </div>

            {/* Filter Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <Icon name="Info" size={16} />
                <span>Use filters to narrow down your search results</span>
              </div>
              
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  iconName="X"
                  iconPosition="left"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Quick Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-muted-foreground">Quick filters:</span>
          {[
            { label: 'Live Matches', value: 'live-matches', icon: 'Radio' },
            { label: 'Top Teams', value: 'top-teams', icon: 'Trophy' },
            { label: 'Player Stats', value: 'player-stats', icon: 'BarChart3' },
            { label: 'Recent News', value: 'recent-news', icon: 'Newspaper' }
          ]?.map((quickFilter) => (
            <Button
              key={quickFilter?.value}
              variant="ghost"
              size="xs"
              onClick={() => handleFilterChange('category', quickFilter?.value)}
              iconName={quickFilter?.icon}
              iconPosition="left"
              className="text-xs"
            >
              {quickFilter?.label}
            </Button>
          ))}
        </div>

        {/* Search Suggestions */}
        {searchQuery && (
          <div className="mt-4 p-3 bg-muted/30 rounded-md">
            <p className="text-sm text-muted-foreground mb-2">Popular searches:</p>
            <div className="flex flex-wrap gap-2">
              {[
                'Dar es Salaam Lions',
                'Player statistics',
                'Match fixtures',
                'League standings',
                'Basketball news'
              ]?.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setSearchQuery(suggestion);
                    onSearch(suggestion);
                  }}
                  className="text-xs px-2 py-1 bg-card border border-border rounded hover:bg-muted transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchAndFilters;