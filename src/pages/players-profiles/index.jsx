import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import { playerService } from '../../services/playerService';
import { teamService } from '../../services/teamService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Image from '../../components/AppImage';
import PlayerProfileModal from './components/PlayerProfileModal';

const positionOptions = [
  { label: 'Point Guard', value: 'point_guard' },
  { label: 'Shooting Guard', value: 'shooting_guard' },
  { label: 'Small Forward', value: 'small_forward' },
  { label: 'Power Forward', value: 'power_forward' },
  { label: 'Center', value: 'center' },
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Injured', value: 'injured' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Transferred', value: 'transferred' },
];

const genderOptions = [
  { label: 'All', value: 'all' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Youth', value: 'youth' },
  { label: 'Mixed', value: 'mixed' },
];

const PlayersProfilesPage = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoadingPlayers, setIsLoadingPlayers] = useState(true);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [playersError, setPlayersError] = useState(null);
  const [teamsError, setTeamsError] = useState(null);
  
  // Filters
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedGender, setSelectedGender] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // View mode
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  
  // Delete confirmation
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Player profile modal
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  
  // Edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [editForm, setEditForm] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    placeOfBirth: '',
    nationality: '',
    // Physical Attributes
    jerseyNumber: '',
    playerPosition: '',
    heightCm: '',
    weightKg: '',
    playerStatus: 'active',
    // Medical Information
    emergencyContactName: '',
    emergencyContactPhone: '',
    medicalConditions: '',
    // Team Information
    teamId: '',
  });
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [banner, setBanner] = useState(null);
  
  // File uploads
  const [editFiles, setEditFiles] = useState({
    playerPhoto: null,
    playerPhotoPreview: null,
    idDocument: null,
    medicalCertificate: null,
    removeExistingPhoto: false,
  });
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({
    photo: false,
    idDocument: false,
    medicalCertificate: false,
  });
  const [playerPhotoDocument, setPlayerPhotoDocument] = useState(null);
  const photoInputRef = useRef(null);
  const idDocumentInputRef = useRef(null);
  const medicalCertificateInputRef = useRef(null);
  const fileInputRefs = {
    playerPhoto: photoInputRef,
    idDocument: idDocumentInputRef,
    medicalCertificate: medicalCertificateInputRef,
  };

  // Check permissions
  const isAdmin = userProfile?.role === 'admin';
  const isTeamManager = userProfile?.role === 'team_manager';
  const canView = isAdmin || isTeamManager;
  const [managedTeamIds, setManagedTeamIds] = useState(new Set());

  const breadcrumbItems = useMemo(
    () => [
      { label: 'Admin Dashboard', path: '/admin-dashboard' },
      { label: 'Players Profiles', path: '/players-profiles' },
    ],
    []
  );

  // Load teams
  const loadTeams = useCallback(async () => {
    setIsLoadingTeams(true);
    setTeamsError(null);
    try {
      let data;
      if (isAdmin) {
        data = await teamService.getAll();
      } else if (isTeamManager) {
        data = await teamService.getManagedTeams();
        // Store managed team IDs for permission checking
        const teamIds = new Set(data?.map(team => team?.id) || []);
        setManagedTeamIds(teamIds);
      } else {
        data = [];
      }
      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      setTeamsError(error?.message || 'Failed to load teams');
    } finally {
      setIsLoadingTeams(false);
    }
  }, [isAdmin, isTeamManager]);

  // Load players
  const loadPlayers = useCallback(async () => {
    setIsLoadingPlayers(true);
    setPlayersError(null);
    try {
      let data;
      if (isAdmin) {
        // Admin can see all players
        data = await playerService.getAll();
      } else if (isTeamManager) {
        // Team manager can only see players from their managed teams
        const allPlayers = await playerService.getAll();
        data = allPlayers?.filter(player => 
          player?.teamId && managedTeamIds.has(player.teamId)
        ) || [];
      } else {
        data = [];
      }
      setPlayers(Array.isArray(data) ? data : []);
    } catch (error) {
      setPlayersError(error?.message || 'Failed to load players');
    } finally {
      setIsLoadingPlayers(false);
    }
  }, [isAdmin, isTeamManager, managedTeamIds]);

  useEffect(() => {
    if (authLoading) return;
    
    if (!canView) {
      navigate('/admin-dashboard', { replace: true });
      return;
    }
    
    loadTeams();
  }, [authLoading, canView, navigate, loadTeams]);

  useEffect(() => {
    if (teams.length > 0 || managedTeamIds.size > 0) {
      loadPlayers();
    }
  }, [teams, managedTeamIds, loadPlayers]);

  // Filter players
  const filteredPlayers = useMemo(() => {
    return players?.filter(player => {
      // Team filter
      if (selectedTeam !== 'all' && player?.teamId !== selectedTeam) {
        return false;
      }
      
      // Gender filter (from team category)
      if (selectedGender !== 'all') {
        const playerTeam = teams.find(t => t?.id === player?.teamId);
        if (!playerTeam || playerTeam?.category !== selectedGender) {
          return false;
        }
      }
      
      // Search filter
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const fullName = player?.userProfile?.fullName?.toLowerCase() || '';
        const email = player?.userProfile?.email?.toLowerCase() || '';
        const jerseyNumber = player?.jerseyNumber?.toString() || '';
        const position = player?.playerPosition?.replace('_', ' ') || '';
        const teamName = player?.team?.name?.toLowerCase() || '';
        
        if (!fullName.includes(term) && 
            !email.includes(term) && 
            !jerseyNumber.includes(term) &&
            !position.includes(term) &&
            !teamName.includes(term)) {
          return false;
        }
      }
      
      return true;
    }) || [];
  }, [players, selectedTeam, selectedGender, searchTerm, teams]);

  // Check if user can edit a player
  const canEditPlayer = (player) => {
    if (isAdmin) return true;
    if (isTeamManager && player?.teamId && managedTeamIds.has(player.teamId)) {
      return true;
    }
    return false;
  };

  // Open edit modal
  const openEditModal = async (player) => {
    if (!canEditPlayer(player)) {
      setBanner({ type: 'error', message: 'You do not have permission to edit this player.' });
      return;
    }
    
    setEditingPlayer(player);
    setEditForm({
      // Personal Information
      fullName: player?.userProfile?.fullName || '',
      email: player?.userProfile?.email || '',
      phone: player?.userProfile?.phone || '',
      dateOfBirth: player?.dateOfBirth || '',
      placeOfBirth: player?.placeOfBirth || '',
      nationality: player?.nationality || '',
      // Physical Attributes
      jerseyNumber: player?.jerseyNumber?.toString() || '',
      playerPosition: player?.playerPosition || '',
      heightCm: player?.heightCm?.toString() || '',
      weightKg: player?.weightKg?.toString() || '',
      playerStatus: player?.playerStatus || 'active',
      // Medical Information
      emergencyContactName: player?.emergencyContactName || '',
      emergencyContactPhone: player?.emergencyContactPhone || '',
      medicalConditions: player?.medicalConditions || '',
      // Team Information
      teamId: player?.teamId || '',
    });
    setEditErrors({});
    setBanner(null);
    
    // Reset file uploads
    setEditFiles({
      playerPhoto: null,
      playerPhotoPreview: null,
      idDocument: null,
      medicalCertificate: null,
      removeExistingPhoto: false,
    });
    setPlayerPhotoDocument(null);
    
    // Load existing documents
    setIsLoadingDocuments(true);
    try {
      const { data: documents, error } = await supabase
        .from('player_documents')
        .select('*')
        .eq('player_id', player?.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setExistingDocuments(documents || []);
      
      const photoDoc = documents?.find((doc) => doc?.document_type === 'player_photo');
      setPlayerPhotoDocument(photoDoc || null);
      
      // Set initial photo preview - use stored photo if available, otherwise fallback to no_image.png
      const documentPreview = photoDoc?.file_path
        ? playerService.getFileUrl(photoDoc.file_path)
        : photoDoc?.file_url || '/assets/images/no_image.png';
      
      setEditFiles((prev) => ({
        ...prev,
        playerPhotoPreview: documentPreview,
      }));
    } catch (error) {
      console.error('Error loading player documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
    
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingPlayer(null);
    setEditForm({
      fullName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      placeOfBirth: '',
      nationality: '',
      jerseyNumber: '',
      playerPosition: '',
      heightCm: '',
      weightKg: '',
      playerStatus: 'active',
      emergencyContactName: '',
      emergencyContactPhone: '',
      medicalConditions: '',
      teamId: '',
    });
    setEditErrors({});
    setEditFiles({
      playerPhoto: null,
      playerPhotoPreview: null,
      idDocument: null,
      medicalCertificate: null,
      removeExistingPhoto: false,
    });
    setExistingDocuments([]);
    setPlayerPhotoDocument(null);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    if (editErrors[field]) {
      setEditErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const resetFileInput = (fieldName) => {
    const targetRef = fileInputRefs?.[fieldName];
    if (targetRef?.current) {
      targetRef.current.value = '';
    }
  };

  // Helper function to normalize URLs (e.g., replace localhost, ensure HTTPS)
  const normalizeUrl = (url) => {
    if (!url) return null;
    let normalized = url.replace(/http:\/\/localhost:3001/g, 'https://api.tanzaniabasketball.com');
    if (normalized.startsWith('http://')) {
      normalized = normalized.replace('http://', 'https://');
    }
    return normalized;
  };

  const getStoredPhotoUrl = () => {
    if (playerPhotoDocument?.file_path) {
      return playerService.getFileUrl(playerPhotoDocument.file_path);
    }
    if (playerPhotoDocument?.file_url) {
      return normalizeUrl(playerPhotoDocument.file_url); // Normalize existing file_url
    }
    // Fallback to no_image.png if no photo exists
    return '/assets/images/no_image.png';
  };

  const handleRemoveExistingPhoto = () => {
    setEditFiles((prev) => ({
      ...prev,
      playerPhoto: null,
      playerPhotoPreview: null,
      removeExistingPhoto: true,
    }));
    resetFileInput('playerPhoto');
  };

  const handlePhotoRemoveClick = () => {
    if (editFiles.playerPhoto) {
      // Removing newly selected photo, revert to stored photo if available
      handleFileUpload(null, 'playerPhoto', { revertToExisting: true });
      return;
    }
    if (playerPhotoDocument || editingPlayer?.userProfile?.avatarUrl) {
      handleRemoveExistingPhoto();
    }
  };

  const handleFileUpload = (file, fieldName, options = {}) => {
    if (file === null) {
      // Remove file
      if (fieldName === 'playerPhoto') {
        const storedUrl = getStoredPhotoUrl();
        if (options?.revertToExisting && storedUrl) {
          setEditFiles(prev => ({
            ...prev,
            playerPhoto: null,
            playerPhotoPreview: storedUrl,
            removeExistingPhoto: false,
          }));
        } else {
          setEditFiles(prev => ({
            ...prev,
            playerPhoto: null,
            playerPhotoPreview: null,
            removeExistingPhoto: options?.removeExisting ?? prev.removeExistingPhoto,
          }));
        }
      } else {
        setEditFiles(prev => ({
          ...prev,
          [fieldName]: null,
        }));
      }
      resetFileInput(fieldName);
      return;
    }

    // Validate file size
    const maxSize = fieldName === 'playerPhoto' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for photo, 10MB for docs
    if (file?.size > maxSize) {
      setEditErrors(prev => ({
        ...prev,
        [fieldName]: `File size must be less than ${fieldName === 'playerPhoto' ? '5MB' : '10MB'}`,
      }));
      resetFileInput(fieldName);
      return;
    }

    // Validate file type for photo
    if (fieldName === 'playerPhoto') {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file?.type)) {
        setEditErrors(prev => ({
          ...prev,
          [fieldName]: 'Please select a valid image file (JPEG, PNG, or WebP)',
        }));
        resetFileInput(fieldName);
        return;
      }
      // Create preview for photo
      const previewUrl = URL.createObjectURL(file);
      setEditFiles(prev => ({
        ...prev,
        playerPhoto: file,
        playerPhotoPreview: previewUrl,
        removeExistingPhoto: prev.removeExistingPhoto,
      }));
    } else {
      // For documents, just store the file
      setEditFiles(prev => ({
        ...prev,
        [fieldName]: file,
      }));
    }

    // Clear error
    if (editErrors?.[fieldName]) {
      setEditErrors(prev => {
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    }
  };

  const openFileDialog = (fieldName) => {
    const ref = fileInputRefs?.[fieldName];
    if (ref?.current) {
      ref.current.click();
    }
  };

  const getDocumentUrl = (document) => {
    if (document?.file_path) {
      return playerService.getFileUrl(document.file_path);
    }
    if (document?.file_url) {
      return normalizeUrl(document.file_url); // Normalize existing file_url
    }
    return null;
  };

  const validateEditForm = () => {
    const errors = {};
    
    // Validate required fields
    if (!editForm.fullName?.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!editForm.email?.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(editForm.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!editForm.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }
    
    if (editForm.jerseyNumber && (isNaN(editForm.jerseyNumber) || parseInt(editForm.jerseyNumber) < 0)) {
      errors.jerseyNumber = 'Jersey number must be a positive number';
    }
    
    if (editForm.heightCm && (isNaN(editForm.heightCm) || parseInt(editForm.heightCm) < 0)) {
      errors.heightCm = 'Height must be a positive number';
    }
    
    if (editForm.weightKg && (isNaN(editForm.weightKg) || parseInt(editForm.weightKg) < 0)) {
      errors.weightKg = 'Weight must be a positive number';
    }
    
    if (editForm.dateOfBirth) {
      const date = new Date(editForm.dateOfBirth);
      if (isNaN(date.getTime())) {
        errors.dateOfBirth = 'Invalid date format';
      }
    }
    
    setEditErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePlayer = async (e) => {
    e?.preventDefault();
    setBanner(null);
    
    if (!validateEditForm()) {
      return;
    }
    
    setIsUpdating(true);
    try {
      const updateData = {
        // User profile fields
        fullName: editForm.fullName?.trim() || null,
        email: editForm.email?.trim() || null,
        phone: editForm.phone?.trim() || null,
        // Player fields
        jerseyNumber: editForm.jerseyNumber ? parseInt(editForm.jerseyNumber) : null,
        playerPosition: editForm.playerPosition || null,
        playerStatus: editForm.playerStatus,
        heightCm: editForm.heightCm ? parseInt(editForm.heightCm) : null,
        weightKg: editForm.weightKg ? parseInt(editForm.weightKg) : null,
        dateOfBirth: editForm.dateOfBirth || null,
        placeOfBirth: editForm.placeOfBirth || null,
        nationality: editForm.nationality || null,
        emergencyContactName: editForm.emergencyContactName || null,
        emergencyContactPhone: editForm.emergencyContactPhone || null,
        medicalConditions: editForm.medicalConditions || null,
      };
      
      // Only include teamId if admin is changing it
      if (isAdmin && editForm.teamId && editForm.teamId !== editingPlayer?.teamId) {
        updateData.teamId = editForm.teamId;
      }
      
      await playerService.update(editingPlayer?.id, updateData);
      
      if (editFiles?.removeExistingPhoto) {
        try {
          await playerService.removePlayerPhoto(editingPlayer?.id, editingPlayer?.userProfileId);
        } catch (error) {
          console.error('Failed to remove existing player photo:', error);
        }
      }
      
      // Upload player photo if a new one was selected
      if (editFiles?.playerPhoto) {
        setUploadingFiles(prev => ({ ...prev, photo: true }));
        try {
          const uploadResult = await playerService.uploadFile(editFiles.playerPhoto, editingPlayer?.id, 'photo');
          
          // Update user profile avatar
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            await supabase
              .from('user_profiles')
              .update({ avatar_url: uploadResult.url })
              .eq('id', editingPlayer?.userProfileId);
          }
          
          // Save photo as document record
          await playerService.savePlayerDocument(editingPlayer?.id, {
            documentType: 'player_photo',
            fileName: uploadResult.fileName,
            filePath: uploadResult.path,
            fileUrl: uploadResult.url,
            fileSize: uploadResult.fileSize,
          });
        } catch (error) {
          console.error('Photo upload failed:', error);
          // Don't block player update if photo upload fails
        } finally {
          setUploadingFiles(prev => ({ ...prev, photo: false }));
        }
      }
      
      // Upload ID document if provided
      if (editFiles?.idDocument) {
        setUploadingFiles(prev => ({ ...prev, idDocument: true }));
        try {
          const uploadResult = await playerService.uploadFile(editFiles.idDocument, editingPlayer?.id, 'document');
          
          await playerService.savePlayerDocument(editingPlayer?.id, {
            documentType: 'id_document',
            fileName: uploadResult.fileName,
            filePath: uploadResult.path,
            fileUrl: uploadResult.url,
            fileSize: uploadResult.fileSize,
          });
        } catch (error) {
          console.error('ID document upload failed:', error);
        } finally {
          setUploadingFiles(prev => ({ ...prev, idDocument: false }));
        }
      }
      
      // Upload medical certificate if provided
      if (editFiles?.medicalCertificate) {
        setUploadingFiles(prev => ({ ...prev, medicalCertificate: true }));
        try {
          const uploadResult = await playerService.uploadFile(editFiles.medicalCertificate, editingPlayer?.id, 'document');
          
          await playerService.savePlayerDocument(editingPlayer?.id, {
            documentType: 'medical_certificate',
            fileName: uploadResult.fileName,
            filePath: uploadResult.path,
            fileUrl: uploadResult.url,
            fileSize: uploadResult.fileSize,
          });
        } catch (error) {
          console.error('Medical certificate upload failed:', error);
        } finally {
          setUploadingFiles(prev => ({ ...prev, medicalCertificate: false }));
        }
      }
      
      // Reload players
      await loadPlayers();
      
      setBanner({ type: 'success', message: 'Player updated successfully.' });
      closeEditModal();
    } catch (error) {
      setBanner({ type: 'error', message: error?.message || 'Failed to update player.' });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    try {
      const date = new Date(value);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return '-';
    }
  };

  const formatHeight = (cm) => {
    if (!cm) return '-';
    const feet = Math.floor(cm / 30.48);
    const inches = Math.round((cm % 30.48) / 2.54);
    return `${feet}'${inches}"`;
  };

  const getPositionLabel = (position) => {
    const option = positionOptions.find(opt => opt.value === position);
    return option?.label || position?.replace('_', ' ') || '-';
  };

  const teamOptions = useMemo(() => {
    const options = [{ label: 'All Teams', value: 'all' }];
    teams.forEach(team => {
      options.push({ label: team?.name || team?.shortName, value: team?.id });
    });
    return options;
  }, [teams]);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(prev => !prev);
  };

  // Delete player handlers
  const openDeleteModal = (player) => {
    setPlayerToDelete(player);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setPlayerToDelete(null);
    setDeleteModalOpen(false);
  };

  const handleDeletePlayer = async () => {
    if (!playerToDelete) return;

    setIsDeleting(true);
    try {
      await playerService.delete(playerToDelete.id);
      
      // Reload players
      await loadPlayers();
      
      setBanner({ type: 'success', message: 'Player deleted successfully.' });
      closeDeleteModal();
    } catch (error) {
      setBanner({ type: 'error', message: error?.message || 'Failed to delete player.' });
    } finally {
      setIsDeleting(false);
    }
  };

  // Player profile modal handlers
  const openProfileModal = (player) => {
    setSelectedPlayer(player);
    setProfileModalOpen(true);
  };

  const closeProfileModal = () => {
    setProfileModalOpen(false);
    setSelectedPlayer(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!canView) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="ShieldAlert" size={48} className="text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleSidebarToggle} />
        <main className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} mt-16 p-6`}>
          <div className="max-w-7xl mx-auto space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Players Profiles</h1>
                <p className="text-muted-foreground mt-1">
                  View and manage player information organized by team or gender.
                </p>
              </div>
              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8"
                    title="Grid View"
                  >
                    <Icon name="LayoutGrid" size={16} />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8"
                    title="List View"
                  >
                    <Icon name="List" size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {banner && (
              <div className={`px-4 py-3 rounded-lg border ${
                banner?.type === 'success' 
                  ? 'bg-success/10 border-success/20 text-success'
                  : 'bg-destructive/10 border-destructive/20 text-destructive'
              }`}>
                <div className="flex items-start gap-3">
                  <Icon
                    name={banner?.type === 'success' ? 'CheckCircle2' : 'AlertTriangle'}
                    size={18}
                  />
                  <p className="font-medium">{banner?.message}</p>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-card border border-border rounded-lg p-4 card-shadow">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Input
                    label="Search"
                    placeholder="Search by name, email, jersey..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    iconName="Search"
                  />
                </div>
                <div>
                  <Select
                    label="Team"
                    options={teamOptions}
                    value={selectedTeam}
                    onChange={(value) => setSelectedTeam(value)}
                    placeholder="All Teams"
                  />
                </div>
                <div>
                  <Select
                    label="Gender"
                    options={genderOptions}
                    value={selectedGender}
                    onChange={(value) => setSelectedGender(value)}
                    placeholder="All"
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedTeam('all');
                      setSelectedGender('all');
                    }}
                    className="w-full"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>

            {/* Players List */}
            {isLoadingPlayers ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="Loader2" size={48} className="text-primary animate-spin" />
              </div>
            ) : playersError ? (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <p className="text-destructive">{playersError}</p>
              </div>
            ) : filteredPlayers.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-12 text-center card-shadow">
                <Icon name="Users" size={48} className="text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No players found matching your filters.</p>
              </div>
            ) : viewMode === 'grid' ? (
              // Grid View
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlayers.map((player) => {
                  const canEdit = canEditPlayer(player);
                  const playerPhotoUrl = playerService.getPlayerPhotoUrl(player);
                  
                  return (
                    <div
                      key={player?.id}
                      className="bg-card border border-border rounded-lg p-4 card-shadow hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div 
                          className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openProfileModal(player)}
                          title="Click to view full profile"
                        >
                          <Image
                            src={playerPhotoUrl}
                            alt={player?.userProfile?.fullName || 'Player'}
                            className="w-16 h-16 rounded-full object-cover border-2 border-border"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <h3 
                                className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => openProfileModal(player)}
                                title="Click to view full profile"
                              >
                                {player?.userProfile?.fullName || 'Unknown Player'}
                              </h3>
                              {player?.jerseyNumber && (
                                <p className="text-sm text-muted-foreground">
                                  #{player.jerseyNumber}
                                </p>
                              )}
                            </div>
                            {canEdit && (
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openEditModal(player)}
                                  className="flex-shrink-0 h-8 w-8"
                                  title="Edit Player"
                                >
                                  <Icon name="Edit" size={16} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteModal(player)}
                                  className="flex-shrink-0 h-8 w-8 text-destructive hover:text-destructive"
                                  title="Delete Player"
                                >
                                  <Icon name="Trash2" size={16} />
                                </Button>
                              </div>
                            )}
                          </div>
                          
                          <div className="mt-2 space-y-1 text-sm">
                            {player?.team && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon name="Users" size={14} />
                                <span className="truncate">{player.team.name}</span>
                              </div>
                            )}
                            {player?.playerPosition && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon name="Target" size={14} />
                                <span>{getPositionLabel(player.playerPosition)}</span>
                              </div>
                            )}
                            {(player?.heightCm || player?.weightKg) && (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Icon name="Ruler" size={14} />
                                <span>
                                  {player.heightCm ? formatHeight(player.heightCm) : '-'}
                                  {player.heightCm && player.weightKg ? ' • ' : ''}
                                  {player.weightKg ? `${player.weightKg}kg` : ''}
                                </span>
                              </div>
                            )}
                            {player?.playerStatus && (
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  player.playerStatus === 'active' 
                                    ? 'bg-success/10 text-success'
                                    : player.playerStatus === 'injured'
                                    ? 'bg-warning/10 text-warning'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {player.playerStatus}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // List View
              <div className="bg-card border border-border rounded-lg card-shadow overflow-hidden">
                <div className="divide-y divide-border">
                  {filteredPlayers.map((player) => {
                    const canEdit = canEditPlayer(player);
                    const playerPhotoUrl = playerService.getPlayerPhotoUrl(player);
                    
                    return (
                      <div
                        key={player?.id}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div 
                            className="flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => openProfileModal(player)}
                            title="Click to view full profile"
                          >
                            <Image
                              src={playerPhotoUrl}
                              alt={player?.userProfile?.fullName || 'Player'}
                              className="w-12 h-12 rounded-full object-cover border-2 border-border"
                            />
                          </div>
                          <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
                            <div className="md:col-span-2">
                              <h3 
                                className="font-semibold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                                onClick={() => openProfileModal(player)}
                                title="Click to view full profile"
                              >
                                {player?.userProfile?.fullName || 'Unknown Player'}
                              </h3>
                              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                                {player?.jerseyNumber && (
                                  <span>#{player.jerseyNumber}</span>
                                )}
                                {player?.playerPosition && (
                                  <span className="flex items-center gap-1">
                                    <Icon name="Target" size={12} />
                                    {getPositionLabel(player.playerPosition)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {player?.team ? (
                                <div className="flex items-center gap-1">
                                  <Icon name="Users" size={14} />
                                  <span className="truncate">{player.team.name}</span>
                                </div>
                              ) : (
                                <span>-</span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {(player?.heightCm || player?.weightKg) ? (
                                <div className="flex items-center gap-1">
                                  <Icon name="Ruler" size={14} />
                                  <span>
                                    {player.heightCm ? formatHeight(player.heightCm) : '-'}
                                    {player.heightCm && player.weightKg ? ' • ' : ''}
                                    {player.weightKg ? `${player.weightKg}kg` : ''}
                                  </span>
                                </div>
                              ) : (
                                <span>-</span>
                              )}
                            </div>
                            <div className="flex items-center justify-between gap-2">
                              {player?.playerStatus && (
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  player.playerStatus === 'active' 
                                    ? 'bg-success/10 text-success'
                                    : player.playerStatus === 'injured'
                                    ? 'bg-warning/10 text-warning'
                                    : 'bg-muted text-muted-foreground'
                                }`}>
                                  {player.playerStatus}
                                </span>
                              )}
                              {canEdit && (
                                <div className="flex items-center gap-1 ml-auto">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openEditModal(player)}
                                    className="h-8 w-8"
                                    title="Edit Player"
                                  >
                                    <Icon name="Edit" size={16} />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => openDeleteModal(player)}
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    title="Delete Player"
                                  >
                                    <Icon name="Trash2" size={16} />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Edit Modal */}
            {editModalOpen && editingPlayer && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-card border border-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto card-shadow">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold text-foreground">
                          Edit Player Information
                        </h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          {editingPlayer?.userProfile?.fullName}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={closeEditModal}
                      >
                        <Icon name="X" size={20} />
                      </Button>
                    </div>

                    <form onSubmit={handleUpdatePlayer} className="space-y-6">
                      {/* Personal Information Card */}
                      <div className="bg-muted/30 border border-border rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon name="User" size={20} className="text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Full Name"
                            value={editForm.fullName}
                            onChange={(e) => handleEditFormChange('fullName', e.target.value)}
                            error={editErrors.fullName}
                            required
                          />
                          <Input
                            label="Email Address"
                            type="email"
                            value={editForm.email}
                            onChange={(e) => handleEditFormChange('email', e.target.value)}
                            error={editErrors.email}
                            required
                          />
                          <Input
                            label="Phone Number"
                            type="tel"
                            value={editForm.phone}
                            onChange={(e) => handleEditFormChange('phone', e.target.value)}
                            error={editErrors.phone}
                            required
                          />
                          <Input
                            label="Date of Birth"
                            type="date"
                            value={editForm.dateOfBirth}
                            onChange={(e) => handleEditFormChange('dateOfBirth', e.target.value)}
                            error={editErrors.dateOfBirth}
                          />
                          <Input
                            label="Place of Birth"
                            value={editForm.placeOfBirth}
                            onChange={(e) => handleEditFormChange('placeOfBirth', e.target.value)}
                          />
                          <Input
                            label="Nationality"
                            value={editForm.nationality}
                            onChange={(e) => handleEditFormChange('nationality', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Physical Attributes Card */}
                      <div className="bg-muted/30 border border-border rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon name="Ruler" size={20} className="text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">Physical Attributes</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Jersey Number"
                            type="number"
                            value={editForm.jerseyNumber}
                            onChange={(e) => handleEditFormChange('jerseyNumber', e.target.value)}
                            error={editErrors.jerseyNumber}
                            min="1"
                            max="99"
                          />
                          <Select
                            label="Position"
                            options={positionOptions}
                            value={editForm.playerPosition}
                            onChange={(value) => handleEditFormChange('playerPosition', value)}
                            placeholder="Select position"
                          />
                          <Input
                            label="Height (cm)"
                            type="number"
                            value={editForm.heightCm}
                            onChange={(e) => handleEditFormChange('heightCm', e.target.value)}
                            error={editErrors.heightCm}
                            min="140"
                            max="250"
                          />
                          <Input
                            label="Weight (kg)"
                            type="number"
                            value={editForm.weightKg}
                            onChange={(e) => handleEditFormChange('weightKg', e.target.value)}
                            error={editErrors.weightKg}
                            min="40"
                            max="200"
                          />
                          <Select
                            label="Status"
                            options={statusOptions}
                            value={editForm.playerStatus}
                            onChange={(value) => handleEditFormChange('playerStatus', value)}
                          />
                          {isAdmin && (
                            <Select
                              label="Team"
                              options={teamOptions.filter(opt => opt.value !== 'all')}
                              value={editForm.teamId}
                              onChange={(value) => handleEditFormChange('teamId', value)}
                              placeholder="Select team"
                              searchable
                            />
                          )}
                        </div>
                      </div>

                      {/* Medical Information Card */}
                      <div className="bg-muted/30 border border-border rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon name="Heart" size={20} className="text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">Medical Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Input
                            label="Emergency Contact Name"
                            value={editForm.emergencyContactName}
                            onChange={(e) => handleEditFormChange('emergencyContactName', e.target.value)}
                            placeholder="Enter emergency contact name"
                          />
                          <Input
                            label="Emergency Contact Phone"
                            type="tel"
                            value={editForm.emergencyContactPhone}
                            onChange={(e) => handleEditFormChange('emergencyContactPhone', e.target.value)}
                            placeholder="+255 XXX XXX XXX"
                          />
                        </div>
                        <div className="mt-4">
                          <label className="text-sm font-medium leading-none mb-2 block">
                            Medical Conditions
                          </label>
                          <textarea
                            className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={editForm.medicalConditions}
                            onChange={(e) => handleEditFormChange('medicalConditions', e.target.value)}
                            placeholder="Enter any medical conditions, allergies, or health concerns..."
                            rows={4}
                          />
                        </div>
                      </div>

                      {/* Team Information Card (Read-only) */}
                      {editingPlayer?.team && (
                        <div className="bg-muted/30 border border-border rounded-lg p-6">
                          <div className="flex items-center gap-2 mb-4">
                            <Icon name="Users" size={20} className="text-primary" />
                            <h3 className="text-lg font-semibold text-foreground">Team Information</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-sm font-medium text-muted-foreground">Current Team</label>
                              <p className="text-foreground font-medium mt-1">{editingPlayer.team.name}</p>
                            </div>
                            {editingPlayer.team.category && (
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Category</label>
                                <p className="text-foreground font-medium mt-1 capitalize">{editingPlayer.team.category}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Documents & Photos Card */}
                      <div className="bg-muted/30 border border-border rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Icon name="FileImage" size={20} className="text-primary" />
                          <h3 className="text-lg font-semibold text-foreground">Documents & Photos</h3>
                        </div>

                        {/* Player Photo */}
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Player Photo</label>
                            <p className="text-xs text-muted-foreground mb-3">
                              Upload a clear, recent photo. Formats: JPEG, PNG, WebP (Max 5MB)
                            </p>
                            {editFiles.playerPhotoPreview ? (
                              <div className="flex items-start gap-4">
                                <div className="relative">
                                  <Image
                                    src={editFiles.playerPhotoPreview}
                                    alt="Player photo preview"
                                    className="w-32 h-32 rounded-lg object-cover border-2 border-border"
                                  />
                                  <button
                                    type="button"
                                    onClick={handlePhotoRemoveClick}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-error text-white rounded-full flex items-center justify-center hover:bg-error/90 transition-colors"
                                    title={editFiles.playerPhoto ? 'Remove selected photo' : 'Remove current photo'}
                                  >
                                    <Icon name="X" size={12} />
                                  </button>
                                </div>
                                <div className="flex-1">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openFileDialog('playerPhoto')}
                                    disabled={uploadingFiles.photo || isUpdating}
                                    iconName="RefreshCw"
                                    iconPosition="left"
                                  >
                                    {uploadingFiles.photo ? 'Uploading...' : 'Change Photo'}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-3">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openFileDialog('playerPhoto')}
                                  disabled={uploadingFiles.photo || isUpdating}
                                  iconName="Upload"
                                  iconPosition="left"
                                >
                                  Upload Photo
                                </Button>
                              </div>
                            )}
                            {editErrors.playerPhoto && (
                              <p className="text-sm text-destructive mt-2">{editErrors.playerPhoto}</p>
                            )}
                        {editFiles.removeExistingPhoto && !editFiles.playerPhotoPreview && (
                          <p className="text-xs text-warning mt-2">
                            Photo will be removed after saving.
                          </p>
                        )}
                          </div>
                        </div>

                        {/* ID Document */}
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">ID Document (Passport/National ID)</label>
                            <p className="text-xs text-muted-foreground mb-3">
                              Upload passport, national ID, or other identification document (Max 10MB)
                            </p>
                            {editFiles.idDocument ? (
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                                  <Icon name="FileText" size={16} className="text-primary" />
                                  <span className="text-sm text-foreground">{editFiles.idDocument.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFileUpload(null, 'idDocument')}
                                  disabled={uploadingFiles.idDocument || isUpdating}
                                >
                                  <Icon name="X" size={16} />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openFileDialog('idDocument')}
                                disabled={uploadingFiles.idDocument || isUpdating}
                                iconName="Upload"
                                iconPosition="left"
                              >
                                {uploadingFiles.idDocument ? 'Uploading...' : 'Upload ID Document'}
                              </Button>
                            )}
                            {editErrors.idDocument && (
                              <p className="text-sm text-destructive mt-2">{editErrors.idDocument}</p>
                            )}
                          </div>
                        </div>

                        {/* Medical Certificate */}
                        <div className="space-y-4 mb-6">
                          <div>
                            <label className="text-sm font-medium text-foreground mb-2 block">Medical Certificate</label>
                            <p className="text-xs text-muted-foreground mb-3">
                              Upload medical clearance certificate (Max 10MB)
                            </p>
                            {editFiles.medicalCertificate ? (
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-md">
                                  <Icon name="FileText" size={16} className="text-primary" />
                                  <span className="text-sm text-foreground">{editFiles.medicalCertificate.name}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFileUpload(null, 'medicalCertificate')}
                                  disabled={uploadingFiles.medicalCertificate || isUpdating}
                                >
                                  <Icon name="X" size={16} />
                                </Button>
                              </div>
                            ) : (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => openFileDialog('medicalCertificate')}
                                disabled={uploadingFiles.medicalCertificate || isUpdating}
                                iconName="Upload"
                                iconPosition="left"
                              >
                                {uploadingFiles.medicalCertificate ? 'Uploading...' : 'Upload Medical Certificate'}
                              </Button>
                            )}
                            {editErrors.medicalCertificate && (
                              <p className="text-sm text-destructive mt-2">{editErrors.medicalCertificate}</p>
                            )}
                          </div>
                        </div>

                        {/* Hidden file inputs */}
                        <input
                          ref={photoInputRef}
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'playerPhoto')}
                        />
                        <input
                          ref={idDocumentInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'idDocument')}
                        />
                        <input
                          ref={medicalCertificateInputRef}
                          type="file"
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e.target.files?.[0] || null, 'medicalCertificate')}
                        />

                        {/* Existing Documents */}
                        {isLoadingDocuments ? (
                          <div className="flex items-center justify-center py-4">
                            <Icon name="Loader2" size={20} className="text-primary animate-spin" />
                          </div>
                        ) : existingDocuments.length > 0 && (
                          <div className="space-y-3 pt-4 border-t border-border">
                            <label className="text-sm font-medium text-foreground">Existing Documents</label>
                            <div className="space-y-2">
                              {existingDocuments.map((doc) => {
                                const docUrl = getDocumentUrl(doc);
                                const docTypeLabels = {
                                  player_photo: 'Player Photo',
                                  id_document: 'ID Document',
                                  medical_certificate: 'Medical Certificate',
                                  transfer_certificate: 'Transfer Certificate',
                                  other: 'Other Document',
                                };
                                
                                return (
                                  <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-3 bg-background border border-border rounded-md"
                                  >
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                      <Icon
                                        name={doc.document_type === 'player_photo' ? 'Image' : 'FileText'}
                                        size={18}
                                        className="text-primary flex-shrink-0"
                                      />
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">
                                          {doc.file_name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          {docTypeLabels[doc.document_type] || 'Document'} • {doc.file_size ? `${(doc.file_size / 1024).toFixed(1)} KB` : 'Unknown size'}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {docUrl && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => window.open(docUrl, '_blank')}
                                          title="View document"
                                        >
                                          <Icon name="Eye" size={16} />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={closeEditModal}
                          disabled={isUpdating}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          loading={isUpdating}
                          disabled={isUpdating}
                          iconName="Save"
                          iconPosition="left"
                        >
                          Update Player
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteModalOpen && playerToDelete && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-card border border-border rounded-lg max-w-md w-full card-shadow">
                  <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <Icon name="AlertTriangle" size={24} className="text-destructive" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-foreground">Delete Player</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                          This action cannot be undone.
                        </p>
                      </div>
                    </div>

                    <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
                      <p className="text-sm text-foreground">
                            Are you sure you want to delete{' '}
                            <span className="font-semibold">
                              {playerToDelete?.userProfile?.fullName || 'this player'}
                            </span>
                            ? This will permanently delete:
                          </p>
                          <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground space-y-1">
                            <li>Player profile and all associated data</li>
                            <li>Player documents and photos</li>
                            <li>All player records</li>
                          </ul>
                          <p className="text-xs text-warning mt-3 font-medium">
                            Note: The user account will not be deleted.
                          </p>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                      <Button
                        variant="outline"
                        onClick={closeDeleteModal}
                        disabled={isDeleting}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeletePlayer}
                        loading={isDeleting}
                        iconName="Trash2"
                        iconPosition="left"
                      >
                        {isDeleting ? 'Deleting...' : 'Delete Player'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Player Profile Modal */}
            <PlayerProfileModal
              player={selectedPlayer}
              isOpen={profileModalOpen}
              onClose={closeProfileModal}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default PlayersProfilesPage;

