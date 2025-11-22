import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import BasicTeamInfo from './components/BasicTeamInfo';
import ContactDetails from './components/ContactDetails';
import OrganizationalStructure from './components/OrganizationalStructure';
import VisualIdentity from './components/VisualIdentity';
import BankingInformation from './components/BankingInformation';
import DocumentUpload from './components/DocumentUpload';
import FormProgress from './components/FormProgress';
import { teamService } from '../../services/teamService';

const TeamRegistration = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    // Basic Team Info
    teamName: '',
    abbreviation: '',
    foundingYear: '',
    category: '',
    division: '',
    homeVenue: '',
    venueAddress: '',
    
    // Contact Details
    streetAddress: '',
    city: '',
    region: '',
    postalCode: '',
    primaryPhone: '',
    secondaryPhone: '',
    officialEmail: '',
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
    teamLogo: '',
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
    
    // Documents
    registrationCertificate: null,
    taxClearance: null,
    constitutionDocument: null,
    officialLetter: null
  });

  const [errors, setErrors] = useState({});
  const [completedSections, setCompletedSections] = useState({
    basicInfo: false,
    contact: false,
    organization: false,
    visual: false,
    banking: false,
    documents: false
  });

  const breadcrumbItems = [
    { label: 'Dashboard', path: '/admin-dashboard' },
    { label: 'Team Registration', path: '/team-registration' }
  ];

  // Mock existing teams for conflict detection
  const existingTeams = [
    { name: 'Dar es Salaam Warriors', abbreviation: 'DSW', primaryColor: '#DC2626' },
    { name: 'Arusha Eagles', abbreviation: 'AE', primaryColor: '#2563EB' },
    { name: 'Mwanza Lions', abbreviation: 'ML', primaryColor: '#16A34A' }
  ];

  useEffect(() => {
    validateCurrentSection();
  }, [formData, currentStep]);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors?.[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (file, fieldName) => {
    if (file === null) {
      // Remove file
      setFormData(prev => ({
        ...prev,
        [fieldName]: null
      }));
      return;
    }

    // Validate file
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file?.size > maxSize) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: 'File size must be less than 10MB'
      }));
      return;
    }

    // Store the actual File object for upload
    if (fieldName === 'teamLogo') {
      // For logo, create preview URL but keep the file
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({
        ...prev,
        [fieldName]: file, // Store File object
        teamLogoPreview: previewUrl // Store preview for display
      }));
    } else {
      // For documents, store the File object
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    }

    // Clear error
    if (errors?.[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }
  };

  const validateCurrentSection = () => {
    const newErrors = {};
    let sectionKey = '';

    switch (currentStep) {
      case 1: // Basic Info
        sectionKey = 'basicInfo';
        if (!formData?.teamName?.trim()) newErrors.teamName = 'Team name is required';
        if (!formData?.abbreviation?.trim()) newErrors.abbreviation = 'Abbreviation is required';
        if (!formData?.foundingYear) newErrors.foundingYear = 'Founding year is required';
        if (!formData?.category) newErrors.category = 'Category is required';
        if (!formData?.division) newErrors.division = 'Division is required';
        if (!formData?.homeVenue?.trim()) newErrors.homeVenue = 'Home venue is required';
        
        // Check for conflicts
        const nameConflict = existingTeams?.find(team => 
          team?.name?.toLowerCase() === formData?.teamName?.toLowerCase()
        );
        if (nameConflict) {
          newErrors.teamName = 'A team with this name already exists';
        }
        
        const abbrevConflict = existingTeams?.find(team => 
          team?.abbreviation?.toLowerCase() === formData?.abbreviation?.toLowerCase()
        );
        if (abbrevConflict) {
          newErrors.abbreviation = 'This abbreviation is already taken';
        }
        break;

      case 2: // Contact
        sectionKey = 'contact';
        if (!formData?.streetAddress?.trim()) newErrors.streetAddress = 'Street address is required';
        if (!formData?.city?.trim()) newErrors.city = 'City is required';
        if (!formData?.region) newErrors.region = 'Region is required';
        if (!formData?.primaryPhone?.trim()) newErrors.primaryPhone = 'Primary phone is required';
        if (!formData?.officialEmail?.trim()) newErrors.officialEmail = 'Official email is required';
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData?.officialEmail && !emailRegex?.test(formData?.officialEmail)) {
          newErrors.officialEmail = 'Please enter a valid email address';
        }
        break;

      case 3: // Organization
        sectionKey = 'organization';
        if (!formData?.presidentName?.trim()) newErrors.presidentName = 'President name is required';
        if (!formData?.presidentPhone?.trim()) newErrors.presidentPhone = 'President phone is required';
        if (!formData?.presidentEmail?.trim()) newErrors.presidentEmail = 'President email is required';
        if (!formData?.presidentId?.trim()) newErrors.presidentId = 'President ID is required';
        if (!formData?.secretaryName?.trim()) newErrors.secretaryName = 'Secretary name is required';
        if (!formData?.secretaryPhone?.trim()) newErrors.secretaryPhone = 'Secretary phone is required';
        if (!formData?.secretaryEmail?.trim()) newErrors.secretaryEmail = 'Secretary email is required';
        if (!formData?.secretaryId?.trim()) newErrors.secretaryId = 'Secretary ID is required';
        if (!formData?.coachName?.trim()) newErrors.coachName = 'Coach name is required';
        if (!formData?.coachPhone?.trim()) newErrors.coachPhone = 'Coach phone is required';
        break;

      case 4: // Visual Identity
        sectionKey = 'visual';
        if (!formData?.teamLogo && !formData?.teamLogoPreview) newErrors.teamLogo = 'Team logo is required';
        if (!formData?.primaryColor) newErrors.primaryColor = 'Primary color is required';
        if (!formData?.secondaryColor) newErrors.secondaryColor = 'Secondary color is required';
        break;

      case 5: // Banking
        sectionKey = 'banking';
        if (!formData?.accountHolderName?.trim()) newErrors.accountHolderName = 'Account holder name is required';
        if (!formData?.bankName) newErrors.bankName = 'Bank name is required';
        if (!formData?.accountNumber?.trim()) newErrors.accountNumber = 'Account number is required';
        if (!formData?.accountType) newErrors.accountType = 'Account type is required';
        if (!formData?.branchName?.trim()) newErrors.branchName = 'Branch name is required';
        break;

      case 6: // Documents
        sectionKey = 'documents';
        if (!formData?.registrationCertificate) newErrors.registrationCertificate = 'Registration certificate is required';
        if (!formData?.taxClearance) newErrors.taxClearance = 'Tax clearance is required';
        if (!formData?.officialLetter) newErrors.officialLetter = 'Official letter is required';
        break;
    }

    setErrors(newErrors);
    
    // Update completion status
    const isComplete = Object.keys(newErrors)?.length === 0;
    setCompletedSections(prev => ({
      ...prev,
      [sectionKey]: isComplete
    }));

    return isComplete;
  };

  const handleNext = () => {
    if (validateCurrentSection()) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    // Validate all sections
    let allValid = true;
    for (let step = 1; step <= 6; step++) {
      setCurrentStep(step);
      if (!validateCurrentSection()) {
        allValid = false;
        break;
      }
    }

    if (!allValid) {
      setCurrentStep(1); // Go to first invalid section
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Save team registration to database
      const registeredTeam = await teamService.registerTeam(formData);
      
      // Show success modal with team ID
      setShowSuccessModal(true);
      setFormData(prev => ({
        ...prev,
        registeredTeamId: registeredTeam?.id,
        uploadWarnings: registeredTeam?.uploadWarnings || []
      }));
    } catch (error) {
      console.error('Registration failed:', error);
      setErrors(prev => ({
        ...prev,
        submit: error?.message || 'Failed to submit registration. Please try again.'
      }));
      // Show error to user
      alert(`Registration failed: ${error?.message || 'Unknown error occurred'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/admin-dashboard');
  };

  const renderCurrentSection = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicTeamInfo
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
          />
        );
      case 2:
        return (
          <ContactDetails
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <OrganizationalStructure
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <VisualIdentity
            formData={formData}
            handleInputChange={handleInputChange}
            handleFileUpload={handleFileUpload}
            errors={errors}
          />
        );
      case 5:
        return (
          <BankingInformation
            formData={formData}
            handleInputChange={handleInputChange}
            errors={errors}
          />
        );
      case 6:
        return (
          <DocumentUpload
            formData={formData}
            handleFileUpload={handleFileUpload}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

  const isFormComplete = Object.values(completedSections)?.every(Boolean);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <main className={`pt-16 transition-all duration-300 ${
        sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
      }`}>
        <div className="p-6">
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Team Registration</h1>
              <p className="text-muted-foreground mt-2">
                Register your basketball team with Tanzania Basketball Federation
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => navigate('/admin-dashboard')}
                iconName="ArrowLeft"
                iconPosition="left"
              >
                Back to Dashboard
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Progress Sidebar */}
            <div className="xl:col-span-1">
              <FormProgress
                currentStep={currentStep}
                totalSteps={6}
                completedSections={completedSections}
              />
            </div>

            {/* Main Form */}
            <div className="xl:col-span-3">
              <div className="space-y-8">
                {renderCurrentSection()}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 1}
                    iconName="ChevronLeft"
                    iconPosition="left"
                  >
                    Previous
                  </Button>

                  <div className="flex items-center space-x-3">
                    {currentStep < 6 ? (
                      <Button
                        variant="default"
                        onClick={handleNext}
                        iconName="ChevronRight"
                        iconPosition="right"
                      >
                        Next Section
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        onClick={handleSubmit}
                        disabled={!isFormComplete || isSubmitting}
                        loading={isSubmitting}
                        iconName="Send"
                        iconPosition="left"
                      >
                        {isSubmitting ? 'Submitting...' : 'Submit Registration'}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Success Modal */}
      {showSuccessModal && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50" onClick={handleSuccessClose} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-lg border border-border p-8 max-w-md w-full modal-shadow">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto">
                  <Icon name="CheckCircle" size={32} className="text-success" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Registration Submitted!</h3>
                <p className="text-muted-foreground">
                  Your team registration has been successfully submitted. 
                  You will receive a confirmation email shortly with your registration reference number.
                </p>
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-foreground">Team ID</p>
                  <p className="text-lg font-mono text-primary">
                    {formData?.registeredTeamId || `TBF-${new Date()?.getFullYear()}-${Math.random()?.toString(36)?.substr(2, 6)?.toUpperCase()}`}
                  </p>
                </div>
                {formData?.uploadWarnings && formData?.uploadWarnings?.length > 0 && (
                  <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Icon name="AlertTriangle" size={20} className="text-warning mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-warning mb-2">
                          Some files could not be uploaded
                        </p>
                        <p className="text-xs text-muted-foreground mb-2">
                          Your team registration was saved successfully, but some documents could not be uploaded. 
                          Please contact support or upload them later.
                        </p>
                        <details className="text-xs">
                          <summary className="cursor-pointer text-warning hover:text-warning/80">
                            View details
                          </summary>
                          <ul className="mt-2 space-y-1 list-disc list-inside">
                            {formData?.uploadWarnings?.map((warning, idx) => (
                              <li key={idx} className="text-muted-foreground">
                                {warning?.documentType}: {warning?.error}
                              </li>
                            ))}
                          </ul>
                        </details>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => navigate('/player-registration')}
                    iconName="UserPlus"
                    iconPosition="left"
                    className="flex-1"
                  >
                    Register Players
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleSuccessClose}
                    className="flex-1"
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TeamRegistration;