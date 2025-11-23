import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { playerService } from '../../services/playerService';
import { teamService } from '../../services/teamService';

// Import form components
import PersonalDetailsForm from './components/PersonalDetailsForm';
import PhysicalAttributesForm from './components/PhysicalAttributesForm';
import MedicalInformationForm from './components/MedicalInformationForm';
import AcademicBackgroundForm from './components/AcademicBackgroundForm';
import EmploymentInformationForm from './components/EmploymentInformationForm';
import PlayerPhotoUpload from './components/PlayerPhotoUpload';
import FormProgressIndicator from './components/FormProgressIndicator';
import FormValidationSummary from './components/FormValidationSummary';

const PlayerRegistration = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationSummary, setShowValidationSummary] = useState(false);
  const [teams, setTeams] = useState([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  const [teamsError, setTeamsError] = useState(null);

  const stepLabels = [
    'Personal Details',
    'Physical Attributes',
    'Medical Information',
    'Academic Background',
    'Employment Information',
    'Player Photo'
  ];

  const totalSteps = stepLabels?.length;

  useEffect(() => {
    // Load saved form data from localStorage
    const savedData = localStorage.getItem('playerRegistrationData');
    if (savedData) {
      setFormData(JSON.parse(savedData));
    }

    // Load saved progress
    const savedProgress = localStorage.getItem('playerRegistrationProgress');
    if (savedProgress) {
      const { currentStep: savedStep, completedSteps: savedCompleted } = JSON.parse(savedProgress);
      setCurrentStep(savedStep);
      setCompletedSteps(savedCompleted);
    }

    // Fetch teams
    const fetchTeams = async () => {
      setIsLoadingTeams(true);
      setTeamsError(null);
      try {
        const teamsData = await teamService.getAll();
        // Filter only active teams
        const activeTeams = teamsData?.filter(team => team.teamStatus === 'active') || [];
        setTeams(activeTeams);
      } catch (error) {
        console.error('Failed to fetch teams:', error);
        setTeamsError(error?.message || 'Failed to load teams');
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTeams();
  }, []);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('playerRegistrationData', JSON.stringify(formData));
  }, [formData]);

  // Save progress to localStorage
  useEffect(() => {
    localStorage.setItem('playerRegistrationProgress', JSON.stringify({
      currentStep,
      completedSteps
    }));
  }, [currentStep, completedSteps]);

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error for this field
    if (errors?.[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors?.[field];
        return newErrors;
      });
    }
  };

  const validateCurrentStep = () => {
    const newErrors = {};

    switch (currentStep) {
      case 0: // Personal Details
        if (!formData?.firstName) newErrors.firstName = 'First name is required';
        if (!formData?.lastName) newErrors.lastName = 'Last name is required';
        if (!formData?.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData?.gender) newErrors.gender = 'Gender is required';
        if (!formData?.nationality) newErrors.nationality = 'Nationality is required';
        if (!formData?.nationalId) newErrors.nationalId = 'National ID is required';
        if (!formData?.phoneNumber) newErrors.phoneNumber = 'Phone number is required';
        if (!formData?.email) newErrors.email = 'Email address is required';
        if (formData?.email && !/\S+@\S+\.\S+/?.test(formData?.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        break;

      case 1: // Physical Attributes
        if (!formData?.height) newErrors.height = 'Height is required';
        if (!formData?.weight) newErrors.weight = 'Weight is required';
        if (!formData?.primaryPosition) newErrors.primaryPosition = 'Primary position is required';
        if (!formData?.jerseyNumber) newErrors.jerseyNumber = 'Jersey number is required';
        break;

      case 2: // Medical Information
        if (!formData?.bloodType) newErrors.bloodType = 'Blood type is required';
        if (!formData?.emergencyContactName) newErrors.emergencyContactName = 'Emergency contact name is required';
        if (!formData?.emergencyContactPhone) newErrors.emergencyContactPhone = 'Emergency contact phone is required';
        if (!formData?.medicalClearanceStatus) newErrors.medicalClearanceStatus = 'Medical clearance status is required';
        if (!formData?.medicalCertificateDate) newErrors.medicalCertificateDate = 'Medical certificate date is required';
        if (!formData?.medicalCertificateExpiry) newErrors.medicalCertificateExpiry = 'Medical certificate expiry is required';
        break;

      case 3: // Academic Background
        if (!formData?.educationLevel) newErrors.educationLevel = 'Education level is required';
        if (!formData?.studentStatus) newErrors.studentStatus = 'Student status is required';
        if (!formData?.institutionName) newErrors.institutionName = 'Institution name is required';
        break;

      case 4: // Employment Information
        if (!formData?.employmentStatus) newErrors.employmentStatus = 'Employment status is required';
        if (!formData?.professionalLevel) newErrors.professionalLevel = 'Professional level is required';
        break;

      case 5: // Player Photo
        if (!formData?.playerPhoto) newErrors.playerPhoto = 'Player photo is required';
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      // Mark current step as completed
      if (!completedSteps?.includes(currentStep)) {
        setCompletedSteps(prev => [...prev, currentStep]);
      }

      // Move to next step
      if (currentStep < totalSteps - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepNavigation = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  const validateAllSteps = () => {
    const allErrors = {};

    // Validate all steps
    for (let step = 0; step < totalSteps; step++) {
      const tempCurrentStep = currentStep;
      setCurrentStep(step);
      const stepErrors = {};

      switch (step) {
        case 0:
          if (!formData?.firstName) stepErrors.firstName = 'First name is required';
          if (!formData?.lastName) stepErrors.lastName = 'Last name is required';
          if (!formData?.dateOfBirth) stepErrors.dateOfBirth = 'Date of birth is required';
          if (!formData?.gender) stepErrors.gender = 'Gender is required';
          if (!formData?.nationality) stepErrors.nationality = 'Nationality is required';
          if (!formData?.nationalId) stepErrors.nationalId = 'National ID is required';
          if (!formData?.phoneNumber) stepErrors.phoneNumber = 'Phone number is required';
          if (!formData?.email) stepErrors.email = 'Email address is required';
          break;
        case 1:
          if (!formData?.height) stepErrors.height = 'Height is required';
          if (!formData?.weight) stepErrors.weight = 'Weight is required';
          if (!formData?.primaryPosition) stepErrors.primaryPosition = 'Primary position is required';
          if (!formData?.jerseyNumber) stepErrors.jerseyNumber = 'Jersey number is required';
          break;
        case 2:
          if (!formData?.bloodType) stepErrors.bloodType = 'Blood type is required';
          if (!formData?.emergencyContactName) stepErrors.emergencyContactName = 'Emergency contact name is required';
          if (!formData?.emergencyContactPhone) stepErrors.emergencyContactPhone = 'Emergency contact phone is required';
          if (!formData?.medicalClearanceStatus) stepErrors.medicalClearanceStatus = 'Medical clearance status is required';
          if (!formData?.medicalCertificateDate) stepErrors.medicalCertificateDate = 'Medical certificate date is required';
          if (!formData?.medicalCertificateExpiry) stepErrors.medicalCertificateExpiry = 'Medical certificate expiry is required';
          break;
        case 3:
          if (!formData?.educationLevel) stepErrors.educationLevel = 'Education level is required';
          if (!formData?.studentStatus) stepErrors.studentStatus = 'Student status is required';
          if (!formData?.institutionName) stepErrors.institutionName = 'Institution name is required';
          break;
        case 4:
          if (!formData?.employmentStatus) stepErrors.employmentStatus = 'Employment status is required';
          if (!formData?.professionalLevel) stepErrors.professionalLevel = 'Professional level is required';
          break;
        case 5:
          if (!formData?.playerPhoto) stepErrors.playerPhoto = 'Player photo is required';
          break;
      }

      Object.assign(allErrors, stepErrors);
      setCurrentStep(tempCurrentStep);
    }

    setErrors(allErrors);
    return Object.keys(allErrors)?.length === 0;
  };

  const handleSubmit = async () => {
    if (!validateAllSteps()) {
      setShowValidationSummary(true);
      return;
    }

    setIsSubmitting(true);
    setShowValidationSummary(false);

    try {
      // Prepare registration data
      const registrationData = {
        // Personal details
        firstName: formData?.firstName,
        lastName: formData?.lastName,
        email: formData?.email,
        phoneNumber: formData?.phoneNumber,
        dateOfBirth: formData?.dateOfBirth,
        gender: formData?.gender,
        nationality: formData?.nationality,
        nationalId: formData?.nationalId,
        placeOfBirth: formData?.placeOfBirth,
        maritalStatus: formData?.maritalStatus,
        // Physical attributes
        height: formData?.height,
        weight: formData?.weight,
        primaryPosition: formData?.primaryPosition,
        jerseyNumber: formData?.jerseyNumber,
        teamId: formData?.teamId,
        // Medical information
        bloodType: formData?.bloodType,
        emergencyContactName: formData?.emergencyContactName,
        emergencyContactPhone: formData?.emergencyContactPhone,
        medicalConditions: formData?.medicalConditions,
        medicalClearanceStatus: formData?.medicalClearanceStatus,
        medicalCertificateDate: formData?.medicalCertificateDate,
        medicalCertificateExpiry: formData?.medicalCertificateExpiry,
        // Academic background
        educationLevel: formData?.educationLevel,
        studentStatus: formData?.studentStatus,
        institutionName: formData?.institutionName,
        // Employment information
        employmentStatus: formData?.employmentStatus,
        professionalLevel: formData?.professionalLevel,
        // Photo
        playerPhotoFile: formData?.playerPhotoFile, // File object for upload
        // Documents
        idDocumentFile: formData?.idDocumentFile, // ID document file
        medicalCertificateFile: formData?.medicalCertificateFile, // Medical certificate file
      };

      // Register player
      const result = await playerService.registerPlayer(registrationData);

      // Clear saved data
      localStorage.removeItem('playerRegistrationData');
      localStorage.removeItem('playerRegistrationProgress');

      // Show success message and redirect
      alert('Player registration submitted successfully!');
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      const errorMessage = error?.message || 'Registration failed. Please try again.';
      alert(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCurrentStepForm = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalDetailsForm
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
            teams={teams}
            isLoadingTeams={isLoadingTeams}
            teamsError={teamsError}
          />
        );
      case 1:
        return (
          <PhysicalAttributesForm
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
            teams={teams}
            isLoadingTeams={isLoadingTeams}
            teamsError={teamsError}
          />
        );
      case 2:
        return (
          <MedicalInformationForm
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
          />
        );
      case 3:
        return (
          <AcademicBackgroundForm
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
          />
        );
      case 4:
        return (
          <EmploymentInformationForm
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
          />
        );
      case 5:
        return (
          <PlayerPhotoUpload
            formData={formData}
            onChange={handleFormChange}
            errors={errors}
          />
        );
      default:
        return null;
    }
  };

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
          <Breadcrumb />
          
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Player Registration</h1>
              <p className="text-muted-foreground">
                Complete player enrollment for league participation
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

          {/* Progress Indicator */}
          <FormProgressIndicator
            currentStep={currentStep}
            completedSteps={completedSteps}
            totalSteps={totalSteps}
            stepLabels={stepLabels}
          />

          {/* Validation Summary */}
          {showValidationSummary && (
            <div className="mb-6">
              <FormValidationSummary
                errors={errors}
                onNavigateToSection={handleStepNavigation}
              />
            </div>
          )}

          {/* Main Form */}
          <div className="bg-card border border-border rounded-lg">
            {/* Form Header */}
            <div className="px-6 py-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    {stepLabels?.[currentStep]}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Step {currentStep + 1} of {totalSteps}
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground">
                    {Math.round(((currentStep + 1) / totalSteps) * 100)}% Complete
                  </span>
                  <div className="w-20 bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6">
              {renderCurrentStepForm()}
            </div>

            {/* Form Navigation */}
            <div className="px-6 py-4 border-t border-border bg-muted/30">
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  iconName="ChevronLeft"
                  iconPosition="left"
                >
                  Previous
                </Button>

                <div className="flex items-center space-x-3">
                  {currentStep === totalSteps - 1 ? (
                    <Button
                      variant="default"
                      onClick={handleSubmit}
                      loading={isSubmitting}
                      iconName="Send"
                      iconPosition="left"
                    >
                      Submit Registration
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      onClick={handleNext}
                      iconName="ChevronRight"
                      iconPosition="right"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-6 bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center space-x-2">
              <Icon name="HelpCircle" size={20} className="text-primary" />
              <span>Need Help?</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Registration Requirements</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Valid national identification document</li>
                  <li>• Current medical clearance certificate</li>
                  <li>• Recent passport-style photograph</li>
                  <li>• Academic institution verification (if student)</li>
                  <li>• Employment verification (if applicable)</li>
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Support Contact</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>Email: registration@tbf.co.tz</p>
                  <p>Phone: +255 123 456 789</p>
                  <p>Office Hours: Mon-Fri, 8:00 AM - 5:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PlayerRegistration;