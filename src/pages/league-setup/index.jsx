import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useAuth } from '../../contexts/AuthContext';
import { leagueService } from '../../services/leagueService';

const LeagueSetup = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { userProfile, loading: authLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    season: '',
    startDate: '',
    endDate: '',
    maxTeams: '12',
    entryFee: '0',
    prizePool: '0',
    description: '',
    rules: ''
  });

  const [errors, setErrors] = useState({});
  
  // File upload states
  const [uploadedFiles, setUploadedFiles] = useState({
    rulesDocument: null,
    regulationsDocument: null,
    otherDocument: null
  });
  const [existingDocuments, setExistingDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});

  // Check if user has access (admin or staff)
  const userRole = userProfile?.role;
  const hasAccess = userRole === 'admin' || userRole === 'staff';

  // Redirect unauthorized users
  useEffect(() => {
    if (authLoading) return;
    
    if (!hasAccess) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [authLoading, hasAccess, navigate]);

  // Load league data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      const loadLeague = async () => {
        setIsLoading(true);
        try {
          const league = await leagueService.getById(id);
          setFormData({
            name: league?.name || '',
            season: league?.season || '',
            startDate: league?.startDate ? league.startDate.split('T')[0] : '',
            endDate: league?.endDate ? league.endDate.split('T')[0] : '',
            maxTeams: league?.maxTeams?.toString() || '12',
            entryFee: league?.entryFee?.toString() || '0',
            prizePool: league?.prizePool?.toString() || '0',
            description: league?.description || '',
            rules: league?.rules || ''
          });
          
          // Load existing documents
          setIsLoadingDocuments(true);
          try {
            const documents = await leagueService.getDocuments(id);
            setExistingDocuments(documents || []);
          } catch (err) {
            console.error('Error loading league documents:', err);
          } finally {
            setIsLoadingDocuments(false);
          }
        } catch (err) {
          console.error('Error loading league:', err);
          setError(err.message || 'Failed to load league data');
        } finally {
          setIsLoading(false);
        }
      };
      loadLeague();
    }
  }, [id, isEditMode]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear success message
    if (success) {
      setSuccess(null);
    }
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'League name is required';
    }

    if (!formData?.season?.trim()) {
      newErrors.season = 'Season is required';
    }

    if (!formData?.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData?.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData?.startDate && formData?.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    if (!formData?.maxTeams || parseInt(formData.maxTeams) < 2) {
      newErrors.maxTeams = 'Minimum 2 teams required';
    }

    if (formData?.entryFee && parseFloat(formData.entryFee) < 0) {
      newErrors.entryFee = 'Entry fee cannot be negative';
    }

    if (formData?.prizePool && parseFloat(formData.prizePool) < 0) {
      newErrors.prizePool = 'Prize pool cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleFileUpload = (file, fieldName) => {
    if (file === null) {
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: null
      }));
      return;
    }

    // Validate file size (10MB max for documents)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than 10MB`);
      return;
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];
    if (!allowedTypes.includes(file.type)) {
      setError('File must be PDF, Word document, or image (JPEG/PNG)');
      return;
    }

    setUploadedFiles(prev => ({
      ...prev,
      [fieldName]: file
    }));

    // Clear error
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const leagueData = {
        name: formData.name.trim(),
        season: formData.season.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        maxTeams: parseInt(formData.maxTeams),
        entryFee: parseFloat(formData.entryFee) || 0,
        prizePool: parseFloat(formData.prizePool) || 0,
        description: formData.description.trim() || null,
        rules: formData.rules.trim() || null
      };

      let leagueId;
      if (isEditMode) {
        await leagueService.update(id, leagueData);
        leagueId = id;
        setSuccess('League updated successfully!');
      } else {
        const newLeague = await leagueService.create(leagueData);
        leagueId = newLeague.id;
        setSuccess('League created successfully!');
      }

      // Upload documents if any were selected
      const documentTypes = {
        rulesDocument: 'rules',
        regulationsDocument: 'regulations',
        otherDocument: 'supporting'
      };

      for (const [fieldName, docType] of Object.entries(documentTypes)) {
        if (uploadedFiles[fieldName]) {
          setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
          try {
            const uploadResult = await leagueService.uploadFile(
              uploadedFiles[fieldName],
              leagueId,
              'document'
            );
            
            await leagueService.saveLeagueDocument(leagueId, {
              documentType: docType,
              fileName: uploadResult.fileName,
              filePath: uploadResult.filePath,
              fileUrl: uploadResult.fileUrl,
              fileSize: uploadResult.fileSize,
              description: `League ${docType} document`
            });
          } catch (uploadErr) {
            console.error(`Error uploading ${fieldName}:`, uploadErr);
            setError(uploadErr.message || `Failed to upload ${fieldName}`);
          } finally {
            setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
          }
        }
      }

      // Redirect to league management after a short delay
      setTimeout(() => {
        navigate('/league-management');
      }, 1500);
    } catch (err) {
      console.error('Error saving league:', err);
      setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} league`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/league-management');
  };

  // Show loading state while checking auth
  if (authLoading || isLoading) {
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

  // Show access denied for unauthorized users
  if (!hasAccess) {
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

  const breadcrumbItems = [
    { label: 'Home', path: '/admin-dashboard' },
    { label: 'League Management', path: '/league-management' },
    { label: isEditMode ? 'Edit League' : 'Setup New League' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <main className={`pt-16 transition-all duration-300 ${
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="p-6">
          {/* Header Section */}
          <div className="mb-6">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={isEditMode ? "Edit" : "Plus"} size={24} className="text-primary" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">
                      {isEditMode ? 'Edit League' : 'Setup New League'}
                    </h1>
                    <p className="text-muted-foreground">
                      {isEditMode ? 'Update league information and settings' : 'Create and configure a new basketball league'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 px-4 py-3 rounded-lg border bg-success/10 border-success/20 text-success">
              <div className="flex items-start gap-3">
                <Icon name="CheckCircle2" size={18} />
                <p className="font-medium">{success}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 px-4 py-3 rounded-lg border bg-destructive/10 border-destructive/20 text-destructive">
              <div className="flex items-start gap-3">
                <Icon name="AlertTriangle" size={18} />
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="bg-card border border-border rounded-lg card-shadow">
            <form onSubmit={handleSubmit} className="p-6 space-y-8">
              {/* Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="Info" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="League Name"
                    type="text"
                    placeholder="e.g., Tanzania Premier League"
                    value={formData?.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={errors?.name}
                    required
                  />
                  
                  <Input
                    label="Season"
                    type="text"
                    placeholder="e.g., 2024-2025"
                    value={formData?.season}
                    onChange={(e) => handleInputChange('season', e.target.value)}
                    error={errors?.season}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Start Date"
                    type="date"
                    value={formData?.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    error={errors?.startDate}
                    required
                  />
                  
                  <Input
                    label="End Date"
                    type="date"
                    value={formData?.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    error={errors?.endDate}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Maximum Teams"
                    type="number"
                    placeholder="e.g., 12"
                    value={formData?.maxTeams}
                    onChange={(e) => handleInputChange('maxTeams', e.target.value)}
                    error={errors?.maxTeams}
                    min="2"
                    max="32"
                    required
                  />

                  <Input
                    label="Entry Fee (TZS)"
                    type="number"
                    placeholder="0"
                    value={formData?.entryFee}
                    onChange={(e) => handleInputChange('entryFee', e.target.value)}
                    error={errors?.entryFee}
                    min="0"
                  />

                  <Input
                    label="Prize Pool (TZS)"
                    type="number"
                    placeholder="0"
                    value={formData?.prizePool}
                    onChange={(e) => handleInputChange('prizePool', e.target.value)}
                    error={errors?.prizePool}
                    min="0"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="FileText" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Additional Information</h3>
                </div>
                
                <div>
                  <label className="text-sm font-medium leading-none mb-2 block">
                    Description
                  </label>
                  <textarea
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Brief description of the league..."
                    value={formData?.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium leading-none mb-2 block">
                    Rules & Regulations
                  </label>
                  <textarea
                    className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="League rules and regulations..."
                    value={formData?.rules}
                    onChange={(e) => handleInputChange('rules', e.target.value)}
                    rows={6}
                  />
                </div>
              </div>

              {/* Supporting Documents */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Icon name="FileText" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Supporting Documents</h3>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">
                  Upload supporting documentation such as League Rules, Regulations, and other relevant documents (PDF, Word, or Images).
                </p>

                {/* Existing Documents */}
                {isEditMode && existingDocuments.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Existing Documents</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {existingDocuments.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Icon name="File" size={20} className="text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {doc.fileName || 'Document'}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {doc.documentType} • {(doc.fileSize / 1024).toFixed(1)} KB
                              </p>
                            </div>
                          </div>
                          {doc.fileUrl && (
                            <a
                              href={doc.filePath ? leagueService.getFileUrl(doc.filePath) : doc.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-primary hover:text-primary/80"
                            >
                              <Icon name="ExternalLink" size={16} />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* File Upload Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      League Rules Document
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="rulesDocument"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files[0] || null, 'rulesDocument')}
                        className="hidden"
                      />
                      <label
                        htmlFor="rulesDocument"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted/50 transition-colors">
                          <Icon name="Upload" size={18} className="text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            {uploadedFiles.rulesDocument
                              ? uploadedFiles.rulesDocument.name
                              : 'Choose Rules Document'}
                          </span>
                        </div>
                      </label>
                      {uploadedFiles.rulesDocument && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileUpload(null, 'rulesDocument')}
                          iconName="X"
                        />
                      )}
                      {uploadingFiles.rulesDocument && (
                        <Icon name="Loader2" size={18} className="text-primary animate-spin" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Regulations Document
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="regulationsDocument"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files[0] || null, 'regulationsDocument')}
                        className="hidden"
                      />
                      <label
                        htmlFor="regulationsDocument"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted/50 transition-colors">
                          <Icon name="Upload" size={18} className="text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            {uploadedFiles.regulationsDocument
                              ? uploadedFiles.regulationsDocument.name
                              : 'Choose Regulations Document'}
                          </span>
                        </div>
                      </label>
                      {uploadedFiles.regulationsDocument && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileUpload(null, 'regulationsDocument')}
                          iconName="X"
                        />
                      )}
                      {uploadingFiles.regulationsDocument && (
                        <Icon name="Loader2" size={18} className="text-primary animate-spin" />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium leading-none mb-2 block">
                      Other Supporting Document
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        id="otherDocument"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e.target.files[0] || null, 'otherDocument')}
                        className="hidden"
                      />
                      <label
                        htmlFor="otherDocument"
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-md hover:bg-muted/50 transition-colors">
                          <Icon name="Upload" size={18} className="text-muted-foreground" />
                          <span className="text-sm text-foreground">
                            {uploadedFiles.otherDocument
                              ? uploadedFiles.otherDocument.name
                              : 'Choose Other Document'}
                          </span>
                        </div>
                      </label>
                      {uploadedFiles.otherDocument && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFileUpload(null, 'otherDocument')}
                          iconName="X"
                        />
                      )}
                      {uploadingFiles.otherDocument && (
                        <Icon name="Loader2" size={18} className="text-primary animate-spin" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="default"
                  loading={isSubmitting}
                  iconName={isEditMode ? "Save" : "Plus"}
                  iconPosition="left"
                >
                  {isEditMode ? 'Update League' : 'Create League'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LeagueSetup;
