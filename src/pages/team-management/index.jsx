import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import { teamService } from '../../services/teamService';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const initialTeamForm = {
  // Basic Team Info
  name: '',
  shortName: '',
  foundedYear: '',
  category: '',
  division: '',
  homeVenue: '',
  venueAddress: '',
  // Contact Details
  address: '',
  city: '',
  region: '',
  postalCode: '',
  primaryPhone: '',
  secondaryPhone: '',
  contactEmail: '',
  website: '',
  // Organizational Structure
  presidentName: '',
  presidentPhone: '',
  presidentEmail: '',
  presidentId: '',
  secretaryName: '',
  secretaryPhone: '',
  secretaryEmail: '',
  secretaryId: '',
  coachName: '',
  coachPhone: '',
  coachEmail: '',
  coachLicense: '',
  // Visual Identity
  logoUrl: '',
  primaryColor: '',
  secondaryColor: '',
  // Banking Information
  accountHolderName: '',
  bankName: '',
  accountNumber: '',
  accountType: '',
  branchName: '',
  branchCode: '',
  swiftCode: '',
  // Admin only fields
  teamManagerId: '',
  teamStatus: 'active',
  registrationStatus: 'approved',
};

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Pending', value: 'pending' },
  { label: 'Suspended', value: 'suspended' },
];

const registrationStatusOptions = [
  { label: 'Approved', value: 'approved' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
];

const categoryOptions = [
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Youth', value: 'youth' },
  { label: 'Mixed', value: 'mixed' },
];

const divisionOptions = [
  { label: 'Premier League', value: 'premier' },
  { label: 'Division 1', value: 'division1' },
  { label: 'Division 2', value: 'division2' },
  { label: 'Regional', value: 'regional' },
];

const accountTypeOptions = [
  { label: 'Savings', value: 'savings' },
  { label: 'Checking', value: 'checking' },
  { label: 'Current', value: 'current' },
];

const TeamManagementPage = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [teams, setTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [teamsError, setTeamsError] = useState(null);
  const [teamManagers, setTeamManagers] = useState([]);
  const [isLoadingManagers, setIsLoadingManagers] = useState(true);
  const [managerError, setManagerError] = useState(null);

  // Check if user is admin or team manager
  const isAdmin = userProfile?.role === 'admin';
  const isTeamManager = userProfile?.role === 'team_manager';
  const canManage = isAdmin || isTeamManager;

  const [createForm, setCreateForm] = useState(initialTeamForm);
  const [createErrors, setCreateErrors] = useState({});
  const [isCreating, setIsCreating] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [editForm, setEditForm] = useState(initialTeamForm);
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  
  // File upload state
  const [editFiles, setEditFiles] = useState({
    teamLogo: null,
    teamLogoPreview: null,
    registrationCertificate: null,
    taxClearance: null,
    constitutionDocument: null,
    officialLetter: null,
  });
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});

  const [deletingTeamIds, setDeletingTeamIds] = useState(new Set());
  const [statusUpdatingIds, setStatusUpdatingIds] = useState(new Set());

  const breadcrumbItems = useMemo(
    () => [
      { label: 'Admin Dashboard', path: '/admin-dashboard' },
      { label: 'Team Management', path: '/team-management' },
    ],
    []
  );

  const managerOptions = useMemo(() => {
    const baseOptions = teamManagers?.map((manager) => ({
      label: manager?.fullName || manager?.email || 'Unnamed Manager',
      value: manager?.id,
      description: manager?.email || undefined,
    }));

    return [{ label: 'Unassigned', value: '' }, ...(baseOptions || [])];
  }, [teamManagers]);

  const filteredTeams = useMemo(() => {
    if (!searchTerm?.trim()) return teams;
    const term = searchTerm?.toLowerCase();

    return teams?.filter((team) => {
      const aggregated = [
        team?.name,
        team?.shortName,
        team?.city,
        team?.region,
        team?.homeVenue,
        team?.teamManager?.fullName,
        team?.contactEmail,
        team?.contactPhone,
      ]
        ?.filter(Boolean)
        ?.join(' ')
        ?.toLowerCase();

      return aggregated?.includes(term);
    });
  }, [teams, searchTerm]);

  const loadTeams = useCallback(async () => {
    const userIsAdmin = userProfile?.role === 'admin';
    const userIsTeamManager = userProfile?.role === 'team_manager';
    const userCanManage = userIsAdmin || userIsTeamManager;
    
    if (!userCanManage) return;
    
    setIsLoadingTeams(true);
    setTeamsError(null);
    try {
      let data;
      if (userIsAdmin) {
        // Admin can see all teams
        data = await teamService.getAll();
      } else if (userIsTeamManager) {
        // Team manager can only see their managed teams
        data = await teamService.getManagedTeams();
      } else {
        data = [];
      }
      setTeams(Array.isArray(data) ? data : []);
    } catch (error) {
      setTeamsError(error?.message || 'Failed to load teams');
    } finally {
      setIsLoadingTeams(false);
    }
  }, [userProfile]);

  const loadManagers = useCallback(async () => {
    setIsLoadingManagers(true);
    setManagerError(null);
    try {
      const data = await userService.listUsers({ role: 'team_manager' });
      setTeamManagers(Array.isArray(data) ? data : []);
    } catch (error) {
      setManagerError(error?.message || 'Failed to load team managers');
    } finally {
      setIsLoadingManagers(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    
    const userIsAdmin = userProfile?.role === 'admin';
    const userIsTeamManager = userProfile?.role === 'team_manager';
    const userCanManage = userIsAdmin || userIsTeamManager;
    
    if (!userCanManage) {
      // Redirect unauthorized users
      navigate('/admin-dashboard');
      return;
    }
    
    loadTeams();
    // Only load managers if admin (for assigning managers)
    if (userIsAdmin) {
      loadManagers();
    }
  }, [authLoading, userProfile, loadTeams, loadManagers, navigate]);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleCreateFormChange = (field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
    setCreateErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
    setEditErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateTeamForm = (formState, setErrors) => {
    const errors = {};
    if (!formState?.name?.trim()) errors.name = 'Team name is required.';
    if (!formState?.shortName?.trim()) errors.shortName = 'Short name is required.';
    if (formState?.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState?.contactEmail)) {
      errors.contactEmail = 'Enter a valid email.';
    }
    if (
      formState?.foundedYear &&
      (Number.isNaN(Number(formState?.foundedYear)) || formState?.foundedYear?.length > 4)
    ) {
      errors.foundedYear = 'Enter a valid year.';
    }
    setErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const mapFormToPayload = (formState) => ({
    // Basic Team Info
    name: formState?.name?.trim(),
    shortName: formState?.shortName?.trim(),
    foundedYear: formState?.foundedYear ? Number(formState?.foundedYear) : null,
    category: formState?.category?.trim() || null,
    division: formState?.division?.trim() || null,
    homeVenue: formState?.homeVenue?.trim() || null,
    venueAddress: formState?.venueAddress?.trim() || null,
    // Contact Details
    address: formState?.address?.trim() || null,
    city: formState?.city?.trim() || null,
    region: formState?.region?.trim() || null,
    postalCode: formState?.postalCode?.trim() || null,
    primaryPhone: formState?.primaryPhone?.trim() || null,
    secondaryPhone: formState?.secondaryPhone?.trim() || null,
    contactEmail: formState?.contactEmail?.trim() || null,
    website: formState?.website?.trim() || null,
    // Organizational Structure
    presidentName: formState?.presidentName?.trim() || null,
    presidentPhone: formState?.presidentPhone?.trim() || null,
    presidentEmail: formState?.presidentEmail?.trim() || null,
    presidentId: formState?.presidentId?.trim() || null,
    secretaryName: formState?.secretaryName?.trim() || null,
    secretaryPhone: formState?.secretaryPhone?.trim() || null,
    secretaryEmail: formState?.secretaryEmail?.trim() || null,
    secretaryId: formState?.secretaryId?.trim() || null,
    coachName: formState?.coachName?.trim() || null,
    coachPhone: formState?.coachPhone?.trim() || null,
    coachEmail: formState?.coachEmail?.trim() || null,
    coachLicense: formState?.coachLicense?.trim() || null,
    // Visual Identity
    logoUrl: formState?.logoUrl?.trim() || null,
    primaryColor: formState?.primaryColor?.trim() || null,
    secondaryColor: formState?.secondaryColor?.trim() || null,
    // Banking Information
    accountHolderName: formState?.accountHolderName?.trim() || null,
    bankName: formState?.bankName?.trim() || null,
    accountNumber: formState?.accountNumber?.trim() || null,
    accountType: formState?.accountType?.trim() || null,
    branchName: formState?.branchName?.trim() || null,
    branchCode: formState?.branchCode?.trim() || null,
    swiftCode: formState?.swiftCode?.trim() || null,
    // Admin only fields
    teamManagerId: formState?.teamManagerId || null,
    teamStatus: formState?.teamStatus,
    registrationStatus: formState?.registrationStatus,
  });

  const mapTeamToForm = (team) => ({
    // Basic Team Info
    name: team?.name || '',
    shortName: team?.shortName || '',
    foundedYear: team?.foundedYear ? String(team?.foundedYear) : '',
    category: team?.category || '',
    division: team?.division || '',
    homeVenue: team?.homeVenue || '',
    venueAddress: team?.venueAddress || '',
    // Contact Details
    address: team?.address || '',
    city: team?.city || '',
    region: team?.region || '',
    postalCode: team?.postalCode || '',
    primaryPhone: team?.primaryPhone || team?.contactPhone || '',
    secondaryPhone: team?.secondaryPhone || '',
    contactEmail: team?.contactEmail || '',
    website: team?.website || '',
    // Organizational Structure
    presidentName: team?.presidentName || '',
    presidentPhone: team?.presidentPhone || '',
    presidentEmail: team?.presidentEmail || '',
    presidentId: team?.presidentId || '',
    secretaryName: team?.secretaryName || '',
    secretaryPhone: team?.secretaryPhone || '',
    secretaryEmail: team?.secretaryEmail || '',
    secretaryId: team?.secretaryId || '',
    coachName: team?.coachName || '',
    coachPhone: team?.coachPhone || '',
    coachEmail: team?.coachEmail || '',
    coachLicense: team?.coachLicense || '',
    // Visual Identity
    logoUrl: team?.logoUrl || '',
    primaryColor: team?.primaryColor || '',
    secondaryColor: team?.secondaryColor || '',
    // Banking Information
    accountHolderName: team?.accountHolderName || '',
    bankName: team?.bankName || '',
    accountNumber: team?.accountNumber || '',
    accountType: team?.accountType || '',
    branchName: team?.branchName || '',
    branchCode: team?.branchCode || '',
    swiftCode: team?.swiftCode || '',
    // Admin only fields
    teamManagerId: team?.teamManagerId || '',
    teamStatus: team?.teamStatus || 'active',
    registrationStatus: team?.registrationStatus || 'approved',
  });

  const handleCreateTeam = async (event) => {
    event?.preventDefault();
    if (!validateTeamForm(createForm, setCreateErrors)) return;

    setIsCreating(true);
    try {
      const newTeam = await teamService.create(mapFormToPayload(createForm));
      setTeams((prev) => (Array.isArray(prev) ? [newTeam, ...prev] : [newTeam]));
      setCreateForm(initialTeamForm);
    } catch (error) {
      setCreateErrors((prev) => ({
        ...prev,
        submit: error?.message || 'Failed to create team, please try again.',
      }));
    } finally {
      setIsCreating(false);
    }
  };

  const openEditModal = async (team) => {
    if (!canEditTeam(team)) {
      window?.alert?.('You do not have permission to edit this team.');
      return;
    }
    setEditingTeam(team);
    setEditForm(mapTeamToForm(team));
    setEditErrors({});
    
    // Reset file uploads
    setEditFiles({
      teamLogo: null,
      teamLogoPreview: team?.logoUrl || null,
      registrationCertificate: null,
      taxClearance: null,
      constitutionDocument: null,
      officialLetter: null,
    });
    
    // Load existing documents
    setIsLoadingDocuments(true);
    try {
      const { data: documents } = await supabase
        .from('team_documents')
        .select('*')
        .eq('team_id', team?.id)
        .order('created_at', { ascending: false });
      
      setExistingDocuments(documents || []);
    } catch (error) {
      console.error('Error loading team documents:', error);
    } finally {
      setIsLoadingDocuments(false);
    }
    
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingTeam(null);
    setEditForm(initialTeamForm);
  };

  const handleEditFileUpload = (file, fieldName) => {
    if (file === null) {
      // Remove file
      setEditFiles(prev => ({
        ...prev,
        [fieldName]: null,
        ...(fieldName === 'teamLogo' ? { teamLogoPreview: null } : {}),
      }));
      return;
    }

    // Validate file size
    const maxSize = fieldName === 'teamLogo' ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for logo, 10MB for docs
    if (file?.size > maxSize) {
      setEditErrors(prev => ({
        ...prev,
        [fieldName]: `File size must be less than ${fieldName === 'teamLogo' ? '5MB' : '10MB'}`,
      }));
      return;
    }

    // Store the file
    if (fieldName === 'teamLogo') {
      const previewUrl = URL.createObjectURL(file);
      setEditFiles(prev => ({
        ...prev,
        teamLogo: file,
        teamLogoPreview: previewUrl,
      }));
    } else {
      setEditFiles(prev => ({
        ...prev,
        [fieldName]: file,
      }));
    }

    // Clear error
    if (editErrors?.[fieldName]) {
      setEditErrors(prev => ({
        ...prev,
        [fieldName]: '',
      }));
    }
  };

  const handleUpdateTeam = async (event) => {
    event?.preventDefault();
    if (!editingTeam?.id) return;
    if (!validateTeamForm(editForm, setEditErrors)) return;

    setIsUpdating(true);
    setEditErrors({});
    
    try {
      let logoUrl = editForm?.logoUrl;
      
      // Upload logo if a new one was selected
      if (editFiles?.teamLogo) {
        setUploadingFiles(prev => ({ ...prev, logo: true }));
        try {
          const uploadResult = await teamService.uploadFile(editFiles.teamLogo, editingTeam?.id, 'logo');
          logoUrl = uploadResult.url;
          
          // Optionally save logo as a document record
          await teamService.saveTeamDocument(editingTeam?.id, {
            documentType: 'team_logo',
            fileName: uploadResult.fileName,
            filePath: uploadResult.path, // Store the storage path
            fileUrl: uploadResult.url,   // Store the public URL
            fileSize: uploadResult.fileSize,
          });
        } catch (error) {
          console.error('Logo upload failed:', error);
          // Don't block team update if logo upload fails
          // User can upload logo later after setting up the bucket
          const errorMessage = error?.message || 'Failed to upload logo';
          if (errorMessage.includes('Bucket not found')) {
            setEditErrors(prev => ({
              ...prev,
              logo: 'Storage bucket not configured. Team will be saved without logo. Please set up the bucket and try uploading again.',
            }));
          } else if (errorMessage.includes('Cannot connect to file upload server') || errorMessage.includes('404')) {
            setEditErrors(prev => ({
              ...prev,
              logo: 'File upload service not available. Please ensure the API server is running and includes the file upload service. Restart the server if needed.',
            }));
          } else {
            setEditErrors(prev => ({
              ...prev,
              logo: `Failed to upload logo: ${errorMessage}. You can update it later.`,
            }));
          }
          // Continue with team update even if logo upload fails
        } finally {
          setUploadingFiles(prev => ({ ...prev, logo: false }));
        }
      }

      // Upload documents
      const documentTypes = {
        registrationCertificate: 'id_document',
        taxClearance: 'id_document',
        constitutionDocument: 'other',
        officialLetter: 'other',
      };

      for (const [fieldName, docType] of Object.entries(documentTypes)) {
        if (editFiles?.[fieldName]) {
          setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
          try {
            const uploadResult = await teamService.uploadFile(editFiles[fieldName], editingTeam?.id, 'document');
            
            // Save document record with both path and URL
            await teamService.saveTeamDocument(editingTeam?.id, {
              documentType: docType,
              fileName: uploadResult.fileName,
              filePath: uploadResult.path, // Store the storage path: teams/{teamId}/documents/...
              fileUrl: uploadResult.url,   // Store the public URL
              fileSize: uploadResult.fileSize,
            });
          } catch (error) {
            console.error(`Document upload failed for ${fieldName}:`, error);
            // Don't block team update if document upload fails
            // Store error for this specific document
            const errorMessage = error?.message || 'Failed to upload document';
            if (errorMessage.includes('Bucket not found')) {
              setEditErrors(prev => ({
                ...prev,
                [fieldName]: 'Storage bucket not configured. Please set up the bucket and try uploading again.',
              }));
            } else {
              setEditErrors(prev => ({
                ...prev,
                [fieldName]: 'Failed to upload document. You can try again later.',
              }));
            }
            // Continue with other uploads and team update
          } finally {
            setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
          }
        }
      }

      // Update team with new logo URL if uploaded
      const updatePayload = mapFormToPayload(editForm);
      if (logoUrl && logoUrl !== editForm?.logoUrl) {
        updatePayload.logoUrl = logoUrl;
      }

      const updatedTeam = await teamService.update(editingTeam?.id, updatePayload);
      setTeams((prev) =>
        prev?.map((team) => (team?.id === updatedTeam?.id ? updatedTeam : team))
      );
      closeEditModal();
    } catch (error) {
      setEditErrors((prev) => ({
        ...prev,
        submit: error?.message || 'Failed to update team, please try again.',
      }));
    } finally {
      setIsUpdating(false);
      setUploadingFiles({});
    }
  };

  const handleDeleteTeam = async (team) => {
    if (!team?.id) return;
    const confirmed = window?.confirm?.(
      `Are you sure you want to delete the team "${team?.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingTeamIds((prev) => new Set(prev)?.add(team?.id));

    try {
      await teamService.delete(team?.id);
      setTeams((prev) => prev?.filter((existing) => existing?.id !== team?.id));
    } catch (error) {
      window?.alert?.(error?.message || 'Failed to delete team.');
    } finally {
      setDeletingTeamIds((prev) => {
        const next = new Set(prev);
        next.delete(team?.id);
        return next;
      });
    }
  };

  const handleToggleStatus = async (team) => {
    if (!team?.id) return;
    const nextStatus = team?.teamStatus === 'active' ? 'inactive' : 'active';

    setStatusUpdatingIds((prev) => new Set(prev)?.add(team?.id));
    try {
      const updatedTeam = await teamService.updateStatus(team?.id, nextStatus);
      setTeams((prev) =>
        prev?.map((existing) => (existing?.id === updatedTeam?.id ? updatedTeam : existing))
      );
    } catch (error) {
      window?.alert?.(error?.message || 'Failed to update team status.');
    } finally {
      setStatusUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(team?.id);
        return next;
      });
    }
  };

  const formatDate = (value) => {
    if (!value) return '-';
    try {
      const date = new Date(value);
      if (Number.isNaN(date?.getTime())) return '-';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })?.format(date);
    } catch {
      return '-';
    }
  };

  const isDeleting = (teamId) => deletingTeamIds?.has(teamId);
  const isStatusUpdating = (teamId) => statusUpdatingIds?.has(teamId);
  
  // Check if current user can edit a specific team
  const canEditTeam = (team) => {
    if (isAdmin) return true;
    if (isTeamManager && team?.teamManagerId === userProfile?.id) return true;
    return false;
  };
  
  // Check if current user can delete a specific team
  const canDeleteTeam = (team) => {
    return isAdmin; // Only admins can delete teams
  };
  
  // Check if current user can change team status
  const canChangeStatus = (team) => {
    return isAdmin; // Only admins can change team status
  };
  
  // Show loading state while auth is loading
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
  
  // Show unauthorized message
  if (!canManage) {
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
        <main className="flex-1 ml-64 mt-16 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
                <p className="text-muted-foreground mt-1">
                  {isAdmin 
                    ? 'Create and maintain official team profiles across the federation.'
                    : 'View and update your team information and details.'}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Users" size={16} />
                <span>{isAdmin ? 'Manage registrations & assignments in one place' : 'Manage your team profile'}</span>
              </div>
            </div>

            <section className="space-y-6">
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6 card-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Registered Teams</h2>
                      <p className="text-sm text-muted-foreground">
                        {isLoadingTeams
                          ? 'Loading teams...'
                          : `${filteredTeams?.length ?? 0} team${
                              filteredTeams?.length === 1 ? '' : 's'
                            } available`}
                      </p>
                    </div>
                    <div className="flex-1 md:max-w-sm">
                      <Input
                        placeholder="Search teams by name, city, manager..."
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event?.target?.value)}
                        iconName="Search"
                      />
                    </div>
                  </div>
                  {teamsError && !isLoadingTeams && (
                    <div className="mt-4 rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-destructive text-sm">
                      {teamsError}
                    </div>
                  )}
                </div>

                <div className="bg-card border border-border rounded-lg card-shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          <th className="px-6 py-3">Team</th>
                          <th className="px-6 py-3">Manager</th>
                          <th className="px-6 py-3">Contact</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Registered</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {isLoadingTeams ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">
                              <div className="flex items-center justify-center gap-2">
                                <svg
                                  className="animate-spin h-5 w-5 text-muted-foreground"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                <span>Loading teams...</span>
                              </div>
                            </td>
                          </tr>
                        ) : filteredTeams?.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-muted-foreground">
                              <div className="flex flex-col items-center gap-3">
                                <Icon name="Ban" size={24} />
                                <p className="font-medium text-foreground">No teams found</p>
                                <p className="text-sm text-muted-foreground">
                                  Adjust your search or create a new team to get started.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredTeams?.map((team) => (
                            <tr key={team?.id} className="hover:bg-muted/40 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground">{team?.name}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {team?.shortName || 'N/A'}
                                  </span>
                                  {team?.homeVenue && (
                                    <span className="text-xs text-muted-foreground flex items-center gap-2 mt-1">
                                      <Icon name="MapPin" size={12} />
                                      {team?.homeVenue}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {team?.teamManager ? (
                                  <div className="flex flex-col text-sm">
                                    <span className="font-medium text-foreground">
                                      {team?.teamManager?.fullName}
                                    </span>
                                    <span className="text-muted-foreground">
                                      {team?.teamManager?.email}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-muted-foreground">Unassigned</span>
                                )}
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                <div className="flex flex-col gap-1">
                                  {team?.contactEmail && (
                                    <span className="flex items-center gap-2">
                                      <Icon name="Mail" size={14} />
                                      {team?.contactEmail}
                                    </span>
                                  )}
                                  {team?.contactPhone && (
                                    <span className="flex items-center gap-2">
                                      <Icon name="Phone" size={14} />
                                      {team?.contactPhone}
                                    </span>
                                  )}
                                  {(team?.city || team?.region) && (
                                    <span className="flex items-center gap-2">
                                      <Icon name="Navigation" size={14} />
                                      {[team?.city, team?.region]?.filter(Boolean)?.join(', ')}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex flex-col gap-2">
                                  <span
                                    className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
                                      team?.teamStatus === 'active'
                                        ? 'bg-success/10 text-success'
                                        : team?.teamStatus === 'inactive'
                                        ? 'bg-muted text-muted-foreground'
                                        : 'bg-warning/10 text-warning'
                                    }`}
                                  >
                                    <span className="w-2 h-2 rounded-full bg-current" />
                                    {team?.teamStatus || 'Unknown'}
                                  </span>
                                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                    <Icon name="ClipboardCheck" size={12} />
                                    {team?.registrationStatus || 'pending'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                <div className="flex flex-col">
                                  <span>{formatDate(team?.registrationDate || team?.createdAt)}</span>
                                  {team?.approvedDate && (
                                    <span className="text-xs">
                                      Approved: {formatDate(team?.approvedDate)}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {canEditTeam(team) && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      iconName="Pencil"
                                      onClick={() => openEditModal(team)}
                                    >
                                      Edit
                                    </Button>
                                  )}
                                  {canChangeStatus(team) && (
                                    <Button
                                      variant={team?.teamStatus === 'active' ? 'warning' : 'success'}
                                      size="sm"
                                      iconName={team?.teamStatus === 'active' ? 'UserX' : 'UserCheck'}
                                      onClick={() => handleToggleStatus(team)}
                                      loading={isStatusUpdating(team?.id)}
                                      disabled={isStatusUpdating(team?.id)}
                                    >
                                      {team?.teamStatus === 'active' ? 'Deactivate' : 'Activate'}
                                    </Button>
                                  )}
                                  {canDeleteTeam(team) && (
                                    <Button
                                      variant="destructive"
                                      size="sm"
                                      iconName="Trash2"
                                      onClick={() => handleDeleteTeam(team)}
                                      loading={isDeleting(team?.id)}
                                      disabled={isDeleting(team?.id)}
                                    >
                                      Delete
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {editModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" style={{ overflow: 'visible' }}>
          <div className="bg-card border border-border rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-xl" style={{ overflowY: 'auto', overflowX: 'visible' }}>
            <div className="sticky top-0 bg-card border-b border-border px-6 py-4 z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">Edit Team</h2>
                  <p className="text-sm text-muted-foreground">
                    Update team information and assignments.
                  </p>
                </div>
                <Button variant="ghost" size="icon" iconName="X" onClick={closeEditModal} />
              </div>
            </div>

            <form className="p-6 space-y-6" onSubmit={handleUpdateTeam} style={{ position: 'relative', overflow: 'visible' }}>
              {/* Basic Team Information Card */}
              <div className="bg-card rounded-lg border border-border shadow-sm" style={{ overflow: 'visible' }}>
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4" style={{ overflow: 'hidden', borderRadius: '0.5rem 0.5rem 0 0' }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon name="Users" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Basic Team Information</h3>
                      <p className="text-sm text-muted-foreground">Update your team's basic details and classification</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Team Name"
                      required
                      value={editForm?.name}
                      onChange={(event) => handleEditFormChange('name', event?.target?.value)}
                      error={editErrors?.name}
                      className="md:col-span-2"
                    />
                    <Input
                      label="Short Name"
                      required
                      value={editForm?.shortName}
                      onChange={(event) =>
                        handleEditFormChange('shortName', event?.target?.value?.toUpperCase())
                      }
                      error={editErrors?.shortName}
                    />
                    <Input
                      label="Founded Year"
                      type="number"
                      value={editForm?.foundedYear}
                      onChange={(event) =>
                        handleEditFormChange('foundedYear', event?.target?.value)
                      }
                      error={editErrors?.foundedYear}
                    />
                    <Select
                      label="Category"
                      value={editForm?.category}
                      onChange={(value) => handleEditFormChange('category', value)}
                      options={categoryOptions}
                      placeholder="Select category"
                    />
                    <Select
                      label="Division"
                      value={editForm?.division}
                      onChange={(value) => handleEditFormChange('division', value)}
                      options={divisionOptions}
                      placeholder="Select division"
                    />
                    <Input
                      label="Home Venue"
                      value={editForm?.homeVenue}
                      onChange={(event) => handleEditFormChange('homeVenue', event?.target?.value)}
                    />
                    <Input
                      label="Venue Address"
                      value={editForm?.venueAddress}
                      onChange={(event) => handleEditFormChange('venueAddress', event?.target?.value)}
                      className="md:col-span-2"
                    />
                    {isAdmin && (
                      <Select
                        label="Team Manager"
                        value={editForm?.teamManagerId}
                        onChange={(value) => handleEditFormChange('teamManagerId', value)}
                        options={managerOptions}
                        loading={isLoadingManagers}
                        description={
                          managerError ? <span className="text-destructive">{managerError}</span> : undefined
                        }
                        className="md:col-span-2"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Details Card */}
              <div className="bg-card rounded-lg border border-border shadow-sm" style={{ overflow: 'visible' }}>
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4" style={{ overflow: 'hidden', borderRadius: '0.5rem 0.5rem 0 0' }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon name="Mail" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Contact Details</h3>
                      <p className="text-sm text-muted-foreground">Update your team's contact information and location</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Official Email"
                      type="email"
                      value={editForm?.contactEmail}
                      onChange={(event) => handleEditFormChange('contactEmail', event?.target?.value)}
                      error={editErrors?.contactEmail}
                    />
                    <Input
                      label="Primary Phone"
                      value={editForm?.primaryPhone}
                      onChange={(event) => handleEditFormChange('primaryPhone', event?.target?.value)}
                    />
                    <Input
                      label="Secondary Phone"
                      value={editForm?.secondaryPhone}
                      onChange={(event) => handleEditFormChange('secondaryPhone', event?.target?.value)}
                    />
                    <Input
                      label="Website"
                      type="url"
                      value={editForm?.website}
                      onChange={(event) => handleEditFormChange('website', event?.target?.value)}
                    />
                    <Input
                      label="Street Address"
                      value={editForm?.address}
                      onChange={(event) => handleEditFormChange('address', event?.target?.value)}
                      className="md:col-span-2"
                    />
                    <Input
                      label="City / District"
                      value={editForm?.city}
                      onChange={(event) => handleEditFormChange('city', event?.target?.value)}
                    />
                    <Input
                      label="Region"
                      value={editForm?.region}
                      onChange={(event) => handleEditFormChange('region', event?.target?.value)}
                    />
                    <Input
                      label="Postal Code"
                      value={editForm?.postalCode}
                      onChange={(event) => handleEditFormChange('postalCode', event?.target?.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Organizational Structure Card */}
              <div className="bg-card rounded-lg border border-border shadow-sm" style={{ overflow: 'visible' }}>
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4" style={{ overflow: 'hidden', borderRadius: '0.5rem 0.5rem 0 0' }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon name="UserCog" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Organizational Structure</h3>
                      <p className="text-sm text-muted-foreground">Update details for team leadership and coaching staff</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="President Name"
                      value={editForm?.presidentName}
                      onChange={(event) => handleEditFormChange('presidentName', event?.target?.value)}
                    />
                    <Input
                      label="President Phone"
                      value={editForm?.presidentPhone}
                      onChange={(event) => handleEditFormChange('presidentPhone', event?.target?.value)}
                    />
                    <Input
                      label="President Email"
                      type="email"
                      value={editForm?.presidentEmail}
                      onChange={(event) => handleEditFormChange('presidentEmail', event?.target?.value)}
                    />
                    <Input
                      label="President ID"
                      value={editForm?.presidentId}
                      onChange={(event) => handleEditFormChange('presidentId', event?.target?.value)}
                    />
                    <Input
                      label="Secretary Name"
                      value={editForm?.secretaryName}
                      onChange={(event) => handleEditFormChange('secretaryName', event?.target?.value)}
                    />
                    <Input
                      label="Secretary Phone"
                      value={editForm?.secretaryPhone}
                      onChange={(event) => handleEditFormChange('secretaryPhone', event?.target?.value)}
                    />
                    <Input
                      label="Secretary Email"
                      type="email"
                      value={editForm?.secretaryEmail}
                      onChange={(event) => handleEditFormChange('secretaryEmail', event?.target?.value)}
                    />
                    <Input
                      label="Secretary ID"
                      value={editForm?.secretaryId}
                      onChange={(event) => handleEditFormChange('secretaryId', event?.target?.value)}
                    />
                    <Input
                      label="Coach Name"
                      value={editForm?.coachName}
                      onChange={(event) => handleEditFormChange('coachName', event?.target?.value)}
                    />
                    <Input
                      label="Coach Phone"
                      value={editForm?.coachPhone}
                      onChange={(event) => handleEditFormChange('coachPhone', event?.target?.value)}
                    />
                    <Input
                      label="Coach Email"
                      type="email"
                      value={editForm?.coachEmail}
                      onChange={(event) => handleEditFormChange('coachEmail', event?.target?.value)}
                    />
                    <Input
                      label="Coach License"
                      value={editForm?.coachLicense}
                      onChange={(event) => handleEditFormChange('coachLicense', event?.target?.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Visual Identity Card */}
              <div className="bg-card rounded-lg border border-border shadow-sm" style={{ overflow: 'visible' }}>
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4" style={{ overflow: 'hidden', borderRadius: '0.5rem 0.5rem 0 0' }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon name="Palette" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Visual Identity</h3>
                      <p className="text-sm text-muted-foreground">Update your team logo and kit colors</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {/* Logo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">
                      Team Logo
                    </label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                      {editFiles?.teamLogoPreview || editForm?.logoUrl ? (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <img
                              src={editFiles?.teamLogoPreview || editForm?.logoUrl}
                              alt="Team logo"
                              className="w-24 h-24 object-contain rounded-lg border border-border"
                            />
                          </div>
                          <div className="flex justify-center space-x-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => document.getElementById('logo-upload')?.click()}
                              iconName="Upload"
                              iconPosition="left"
                              disabled={uploadingFiles?.logo}
                            >
                              {uploadingFiles?.logo ? 'Uploading...' : 'Change Logo'}
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditFileUpload(null, 'teamLogo')}
                              iconName="Trash2"
                              iconPosition="left"
                            >
                              Remove
                            </Button>
                          </div>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleEditFileUpload(e.target.files[0], 'teamLogo');
                              }
                            }}
                            className="hidden"
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Icon name="Upload" size={48} className="mx-auto text-muted-foreground" />
                          <div>
                            <p className="text-foreground font-medium">Upload team logo</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              PNG, JPG up to 5MB. Recommended: 512x512px
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('logo-upload')?.click()}
                            iconName="Upload"
                            iconPosition="left"
                            disabled={uploadingFiles?.logo}
                          >
                            {uploadingFiles?.logo ? 'Uploading...' : 'Choose File'}
                          </Button>
                          <input
                            id="logo-upload"
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handleEditFileUpload(e.target.files[0], 'teamLogo');
                              }
                            }}
                            className="hidden"
                          />
                        </div>
                      )}
                    </div>
                    {editErrors?.logo && (
                      <div className="mt-2 p-3 bg-warning/10 border border-warning/20 rounded-lg">
                        <p className="text-sm text-warning flex items-start space-x-2">
                          <Icon name="AlertTriangle" size={16} className="mt-0.5 flex-shrink-0" />
                          <span>{editErrors?.logo}</span>
                        </p>
                        {editErrors?.logo?.includes('Bucket not found') && (
                          <div className="mt-2 text-xs text-warning">
                            <p className="font-medium mb-1">Quick Setup:</p>
                            <ol className="list-decimal list-inside space-y-1">
                              <li>Go to Supabase Dashboard → Storage</li>
                              <li>Create bucket named: <code className="bg-warning/20 px-1 rounded">team-documents</code></li>
                              <li>Run migration: <code className="bg-warning/20 px-1 rounded">20250116000001_setup_team_documents_storage.sql</code></li>
                            </ol>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Kit Colors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Primary Color"
                      type="color"
                      value={editForm?.primaryColor || '#DC2626'}
                      onChange={(event) => handleEditFormChange('primaryColor', event?.target?.value)}
                    />
                    <Input
                      label="Secondary Color"
                      type="color"
                      value={editForm?.secondaryColor || '#F59E0B'}
                      onChange={(event) => handleEditFormChange('secondaryColor', event?.target?.value)}
                    />
                  </div>
                </div>
              </div>

              {/* File Uploads Card */}
              <div className="bg-card rounded-lg border border-border shadow-sm" style={{ overflow: 'visible' }}>
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4" style={{ overflow: 'hidden', borderRadius: '0.5rem 0.5rem 0 0' }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon name="Upload" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Team Documents</h3>
                      <p className="text-sm text-muted-foreground">Upload team registration documents and certificates</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 mb-6">
                    <div className="flex items-start space-x-2">
                      <Icon name="AlertCircle" size={16} className="text-warning mt-0.5" />
                      <div className="text-sm text-warning">
                        <p className="font-medium">Document Requirements</p>
                        <p className="mt-1">
                          All documents must be clear, legible, and in valid formats. Maximum file size: 10MB per document.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Existing Documents */}
                  {existingDocuments?.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-sm font-medium text-foreground mb-3">Existing Documents</h4>
                      <div className="space-y-2">
                        {existingDocuments.map((doc) => {
                          // Prioritize file_path for local storage (stored as: teams/{teamId}/logo/{filename})
                          // file_path is the local file path stored in the database
                          // file_url is the full URL (constructed from file_path or legacy URL)
                          const fileUrl = doc.file_path 
                            ? teamService.getFileUrl(doc.file_path)  // Generate URL from local path
                            : doc.file_url || null;  // Fallback to stored URL (for backward compatibility)
                          const displayPath = doc.file_path ? doc.file_path : null;
                          
                          return (
                            <div
                              key={doc.id}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg"
                            >
                              <div className="flex items-center space-x-3 flex-1 min-w-0">
                                <Icon name="FileText" size={20} className="text-primary flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {doc.document_type?.replace(/_/g, ' ')} • {doc.is_verified ? 'Verified' : 'Pending verification'}
                                  </p>
                                  {displayPath && (
                                    <p className="text-xs text-muted-foreground truncate" title={doc.file_path}>
                                      {displayPath}
                                    </p>
                                  )}
                                </div>
                              </div>
                              {fileUrl && (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:text-primary/80 flex-shrink-0 ml-2"
                                  title="View document"
                                >
                                  <Icon name="ExternalLink" size={16} />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Document Upload Fields */}
                  <div className="space-y-6">
                    {[
                      {
                        key: 'registrationCertificate',
                        label: 'Team Registration Certificate',
                        description: 'Official team registration document',
                        required: false,
                        acceptedFormats: '.pdf,.jpg,.jpeg,.png',
                      },
                      {
                        key: 'taxClearance',
                        label: 'Tax Clearance Certificate',
                        description: 'Valid tax clearance from TRA',
                        required: false,
                        acceptedFormats: '.pdf,.jpg,.jpeg,.png',
                      },
                      {
                        key: 'constitutionDocument',
                        label: 'Team Constitution',
                        description: 'Team constitution and bylaws',
                        required: false,
                        acceptedFormats: '.pdf,.doc,.docx',
                      },
                      {
                        key: 'officialLetter',
                        label: 'Official Letter of Intent',
                        description: 'Letter expressing intent to participate',
                        required: false,
                        acceptedFormats: '.pdf,.doc,.docx',
                      },
                    ].map((docType) => (
                      <div key={docType.key} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="text-sm font-medium text-foreground">
                              {docType.label}
                              {docType.required && <span className="text-error ml-1">*</span>}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1">{docType.description}</p>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {docType.acceptedFormats.replace(/\./g, '').toUpperCase()}
                          </div>
                        </div>

                        <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
                          {editFiles?.[docType.key] ? (
                            <div className="space-y-3">
                              <div className="flex items-center justify-center space-x-2">
                                <Icon name="FileText" size={24} className="text-success" />
                                <div className="text-left">
                                  <p className="text-sm font-medium text-foreground">
                                    {editFiles[docType.key].name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(editFiles[docType.key].size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <div className="flex justify-center space-x-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => document.getElementById(`${docType.key}-upload`)?.click()}
                                  iconName="Upload"
                                  iconPosition="left"
                                  disabled={uploadingFiles?.[docType.key]}
                                >
                                  {uploadingFiles?.[docType.key] ? 'Uploading...' : 'Replace'}
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditFileUpload(null, docType.key)}
                                  iconName="Trash2"
                                  iconPosition="left"
                                >
                                  Remove
                                </Button>
                              </div>
                              <input
                                id={`${docType.key}-upload`}
                                type="file"
                                accept={docType.acceptedFormats}
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleEditFileUpload(e.target.files[0], docType.key);
                                  }
                                }}
                                className="hidden"
                              />
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <Icon name="Upload" size={32} className="mx-auto text-muted-foreground" />
                              <div>
                                <p className="text-sm text-foreground">Drop file here or click to browse</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {docType.acceptedFormats.replace(/\./g, '').toUpperCase()} up to 10MB
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => document.getElementById(`${docType.key}-upload`)?.click()}
                                iconName="Upload"
                                iconPosition="left"
                                disabled={uploadingFiles?.[docType.key]}
                              >
                                {uploadingFiles?.[docType.key] ? 'Uploading...' : 'Choose File'}
                              </Button>
                              <input
                                id={`${docType.key}-upload`}
                                type="file"
                                accept={docType.acceptedFormats}
                                onChange={(e) => {
                                  if (e.target.files?.[0]) {
                                    handleEditFileUpload(e.target.files[0], docType.key);
                                  }
                                }}
                                className="hidden"
                              />
                            </div>
                          )}
                        </div>

                        {editErrors?.[docType.key] && (
                          <p className="text-sm text-error mt-2">{editErrors[docType.key]}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Banking Information Card */}
              <div className="bg-card rounded-lg border border-border shadow-sm" style={{ overflow: 'visible' }}>
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4" style={{ overflow: 'hidden', borderRadius: '0.5rem 0.5rem 0 0' }}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Icon name="CreditCard" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Banking Information</h3>
                      <p className="text-sm text-muted-foreground">Update banking details for transactions and prize distribution</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Account Holder Name"
                      value={editForm?.accountHolderName}
                      onChange={(event) => handleEditFormChange('accountHolderName', event?.target?.value)}
                    />
                    <Input
                      label="Bank Name"
                      value={editForm?.bankName}
                      onChange={(event) => handleEditFormChange('bankName', event?.target?.value)}
                    />
                    <Input
                      label="Account Number"
                      value={editForm?.accountNumber}
                      onChange={(event) => handleEditFormChange('accountNumber', event?.target?.value)}
                    />
                    <Select
                      label="Account Type"
                      value={editForm?.accountType}
                      onChange={(value) => handleEditFormChange('accountType', value)}
                      options={accountTypeOptions}
                      placeholder="Select account type"
                    />
                    <Input
                      label="Branch Name"
                      value={editForm?.branchName}
                      onChange={(event) => handleEditFormChange('branchName', event?.target?.value)}
                    />
                    <Input
                      label="Branch Code"
                      value={editForm?.branchCode}
                      onChange={(event) => handleEditFormChange('branchCode', event?.target?.value)}
                    />
                    <Input
                      label="SWIFT Code"
                      value={editForm?.swiftCode}
                      onChange={(event) => handleEditFormChange('swiftCode', event?.target?.value)}
                      className="md:col-span-2"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Settings Card */}
              {isAdmin && (
                <div className="bg-card rounded-lg border border-border shadow-sm overflow-visible">
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon name="Settings" size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">Admin Settings</h3>
                        <p className="text-sm text-muted-foreground">Manage team status and registration approval</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Select
                        label="Team Status"
                        value={editForm?.teamStatus}
                        onChange={(value) => handleEditFormChange('teamStatus', value)}
                        options={statusOptions}
                      />
                      <Select
                        label="Registration Status"
                        value={editForm?.registrationStatus}
                        onChange={(value) =>
                          handleEditFormChange('registrationStatus', value)
                        }
                        options={registrationStatusOptions}
                      />
                    </div>
                  </div>
                </div>
              )}

              {editErrors?.submit && (
                <p className="text-sm text-destructive">{editErrors?.submit}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <Button type="button" variant="ghost" onClick={closeEditModal} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  iconName="Save"
                  loading={isUpdating}
                  disabled={isUpdating}
                >
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagementPage;


