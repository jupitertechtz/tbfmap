import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Image from '../../components/AppImage';
import { officialService } from '../../services/officialService';
import { useAuth } from '../../contexts/AuthContext';

const CATEGORY_CONFIG = [
  {
    key: 'Referee',
    label: 'Referees',
    description: 'Court officials responsible for enforcing the rules of the game.',
    icon: 'Whistle',
  },
  {
    key: 'Table Official',
    label: 'Table Officials',
    description: 'Manage game clock, statistics, and official documentation.',
    icon: 'ClipboardList',
  },
  {
    key: 'Commissioner',
    label: 'Commissioners',
    description: 'Oversee game operations and ensure compliance with league standards.',
    icon: 'Shield',
  },
];

const LeagueOfficials = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [officials, setOfficials] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedOfficialForPhoto, setSelectedOfficialForPhoto] = useState(null);
  const [selectedOfficialForProfile, setSelectedOfficialForProfile] = useState(null);
  
  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    const fetchOfficials = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await officialService.getAll();
        setOfficials(data || []);
      } catch (err) {
        console.error('Error loading officials:', err);
        setError(err.message || 'Failed to load officials');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOfficials();
  }, []);

  const groupedOfficials = useMemo(() => {
    return CATEGORY_CONFIG.reduce((acc, category) => {
      acc[category.key] = officials.filter(
        (official) => official.specialization === category.key
      );
      return acc;
    }, {});
  }, [officials]);

  const breadcrumbItems = [
    { label: 'Home', path: '/admin-dashboard' },
    { label: 'League Management', path: '/league-management' },
    { label: 'League Officials' },
  ];

  const openPhotoModal = (official) => {
    setSelectedOfficialForPhoto(official);
    setPhotoModalOpen(true);
  };

  const closePhotoModal = () => {
    setPhotoModalOpen(false);
    setSelectedOfficialForPhoto(null);
  };

  const openProfileModal = (official) => {
    setSelectedOfficialForProfile(official);
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
    setSelectedOfficialForProfile(null);
  };

  const renderOfficialCard = (official) => {
    // Use officialService helper method for consistent photo URL resolution
    const photo = officialService.getOfficialPhotoUrl(official);
    return (
      <div
        key={official.id}
        className="bg-card border border-border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors relative"
      >
        {/* Edit button - only visible to admins */}
        {isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={() => navigate(`/official-registration?edit=${official.id}`)}
            title="Edit Official"
          >
            <Icon name="Edit" size={16} className="text-muted-foreground hover:text-primary" />
          </Button>
        )}
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            className="w-14 h-14 rounded-full overflow-hidden border border-border focus:outline-none focus:ring-2 focus:ring-primary/40"
            onClick={() => openPhotoModal(official)}
            title="Click to view full photo"
          >
            <Image src={photo} alt={official?.userProfile?.fullName || 'Official'} className="w-full h-full object-cover" />
          </button>
          <div className="flex-1">
            <button
              type="button"
              className="text-sm font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 text-left"
              onClick={() => openProfileModal(official)}
              title="Click to view full profile"
            >
              {official?.userProfile?.fullName || 'Unknown Official'}
            </button>
            <p className="text-xs text-muted-foreground">
              {official?.certificationLevel || 'Certification Level N/A'}
            </p>
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              official?.isAvailable
                ? 'bg-success/10 text-success'
                : 'bg-muted text-muted-foreground'
            }`}
          >
            {official?.isAvailable ? 'Available' : 'Unavailable'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground text-xs">License</p>
            <p>{official?.licenseNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium text-foreground text-xs">Experience</p>
            <p>{official?.experienceYears || 0} years</p>
          </div>
          <div>
            <p className="font-medium text-foreground text-xs">Email</p>
            <p className="truncate">{official?.userProfile?.email || 'N/A'}</p>
          </div>
          <div>
            <p className="font-medium text-foreground text-xs">Phone</p>
            <p>{official?.userProfile?.phone || 'N/A'}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderOfficialListItem = (official) => {
    // Use officialService helper method for consistent photo URL resolution
    const photo = officialService.getOfficialPhotoUrl(official);
    return (
      <div
        key={official.id}
        className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="w-16 h-16 rounded-full overflow-hidden border border-border flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/40"
            onClick={() => openPhotoModal(official)}
            title="Click to view full photo"
          >
            <Image src={photo} alt={official?.userProfile?.fullName || 'Official'} className="w-full h-full object-cover" />
          </button>
          
          <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            <div className="md:col-span-2">
              <button
                type="button"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 text-left"
                onClick={() => openProfileModal(official)}
                title="Click to view full profile"
              >
                {official?.userProfile?.fullName || 'Unknown Official'}
              </button>
              <p className="text-xs text-muted-foreground">
                {official?.certificationLevel || 'Certification Level N/A'}
              </p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">License</p>
              <p className="text-sm font-medium text-foreground">{official?.licenseNumber || 'N/A'}</p>
            </div>
            
            <div>
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="text-sm font-medium text-foreground">{official?.experienceYears || 0} years</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  official?.isAvailable
                    ? 'bg-success/10 text-success'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {official?.isAvailable ? 'Available' : 'Unavailable'}
              </span>
              
              {/* Edit button - only visible to admins */}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => navigate(`/official-registration?edit=${official.id}`)}
                >
                  <Icon name="Edit" size={14} className="mr-1" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        <Header />
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <main
          className={`pt-16 transition-all duration-300 ${
            isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
          }`}
        >
          <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col space-y-4">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="UserCheck" size={24} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">League Officials</h1>
                  <p className="text-muted-foreground">
                    View and manage referees, table officials, and commissioners
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setViewMode('grid')}
                    title="Grid View"
                  >
                    <Icon name="Grid3x3" size={16} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 px-3"
                    onClick={() => setViewMode('list')}
                    title="List View"
                  >
                    <Icon name="List" size={16} />
                  </Button>
                </div>
                <Button
                  variant="default"
                  iconName="Plus"
                  iconPosition="left"
                  onClick={() => navigate('/official-registration')}
                >
                  Register New Official
                </Button>
              </div>
            </div>
          </div>

          {/* Loading / Error States */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Icon name="Loader2" size={32} className="text-primary animate-spin" />
            </div>
          ) : error ? (
            <div className="px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={18} />
                <div>
                  <p className="font-medium">Error loading officials</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {CATEGORY_CONFIG.map((category) => (
                <div key={category.key} className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Icon name={category.icon} size={18} className="text-primary" />
                        <h2 className="text-xl font-semibold text-foreground">
                          {category.label}
                        </h2>
                      </div>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      {groupedOfficials[category.key]?.length || 0} officials
                    </span>
                  </div>

                  {groupedOfficials[category.key]?.length ? (
                    viewMode === 'grid' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {groupedOfficials[category.key].map(renderOfficialCard)}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {groupedOfficials[category.key].map(renderOfficialListItem)}
                      </div>
                    )
                  ) : (
                    <div className="bg-muted/30 border border-dashed border-border rounded-lg p-6 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <Icon name="Users" size={24} className="text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          No {category.label.toLowerCase()} registered yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          </div>
        </main>
      </div>

      {photoModalOpen && selectedOfficialForPhoto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={closePhotoModal}>
          <div className="relative max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white"
              onClick={closePhotoModal}
            >
              <Icon name="X" size={20} />
            </Button>
            <Image
              src={officialService.getOfficialPhotoUrl(selectedOfficialForPhoto)}
              alt={selectedOfficialForPhoto?.userProfile?.fullName || 'Official photo'}
              className="w-full h-full object-contain rounded-lg bg-black"
            />
          </div>
        </div>
      )}

      {profileModalOpen && selectedOfficialForProfile && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeProfileModal}>
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto card-shadow" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedOfficialForProfile?.userProfile?.fullName || 'Official Profile'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {selectedOfficialForProfile?.specialization || 'League Official'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeProfileModal}>
                <Icon name="X" size={18} />
              </Button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-border mx-auto sm:mx-0">
                  <Image
                    src={officialService.getOfficialPhotoUrl(selectedOfficialForProfile)}
                    alt={selectedOfficialForProfile?.userProfile?.fullName || 'Official'}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Certification Level</p>
                    <p className="text-base font-medium text-foreground">
                      {selectedOfficialForProfile?.certificationLevel || 'N/A'}
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">License Number</p>
                      <p className="text-base font-medium text-foreground">
                        {selectedOfficialForProfile?.licenseNumber || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Experience</p>
                      <p className="text-base font-medium text-foreground">
                        {selectedOfficialForProfile?.experienceYears || 0} years
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Mail" size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">Email</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedOfficialForProfile?.userProfile?.email || 'N/A'}
                  </p>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon name="Phone" size={16} className="text-primary" />
                    <span className="text-sm font-medium text-foreground">Phone</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {selectedOfficialForProfile?.userProfile?.phone || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name="ClipboardList" size={16} className="text-primary" />
                  <span className="text-sm font-medium text-foreground">Specialization</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedOfficialForProfile?.specialization || 'Not specified'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeagueOfficials;

