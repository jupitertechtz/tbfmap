import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const AcademicBackgroundForm = ({ formData, onChange, errors }) => {
  const educationLevelOptions = [
    { value: 'primary', label: 'Primary Education' },
    { value: 'secondary', label: 'Secondary Education (O-Level)' },
    { value: 'advanced', label: 'Advanced Secondary (A-Level)' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'diploma', label: 'Diploma' },
    { value: 'bachelor', label: 'Bachelor\'s Degree' },
    { value: 'master', label: 'Master\'s Degree' },
    { value: 'doctorate', label: 'Doctorate/PhD' }
  ];

  const studentStatusOptions = [
    { value: 'current', label: 'Current Student' },
    { value: 'graduated', label: 'Graduated' },
    { value: 'not_student', label: 'Not a Student' }
  ];

  const gradeYearOptions = [
    { value: 'form1', label: 'Form 1' },
    { value: 'form2', label: 'Form 2' },
    { value: 'form3', label: 'Form 3' },
    { value: 'form4', label: 'Form 4' },
    { value: 'form5', label: 'Form 5' },
    { value: 'form6', label: 'Form 6' },
    { value: 'year1', label: 'Year 1' },
    { value: 'year2', label: 'Year 2' },
    { value: 'year3', label: 'Year 3' },
    { value: 'year4', label: 'Year 4' },
    { value: 'year5', label: 'Year 5' }
  ];

  const fieldOfStudyOptions = [
    { value: 'science', label: 'Science' },
    { value: 'arts', label: 'Arts' },
    { value: 'commerce', label: 'Commerce' },
    { value: 'engineering', label: 'Engineering' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'law', label: 'Law' },
    { value: 'education', label: 'Education' },
    { value: 'business', label: 'Business Administration' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'technology', label: 'Information Technology' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Select
          label="Highest Education Level"
          options={educationLevelOptions}
          value={formData?.educationLevel || ''}
          onChange={(value) => onChange('educationLevel', value)}
          error={errors?.educationLevel}
          required
        />
        
        <Select
          label="Current Student Status"
          options={studentStatusOptions}
          value={formData?.studentStatus || ''}
          onChange={(value) => onChange('studentStatus', value)}
          error={errors?.studentStatus}
          required
        />
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Current/Most Recent Institution</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Institution Name"
            type="text"
            placeholder="Enter school/university name"
            value={formData?.institutionName || ''}
            onChange={(e) => onChange('institutionName', e?.target?.value)}
            error={errors?.institutionName}
            required
          />
          
          <Input
            label="Institution Location"
            type="text"
            placeholder="Enter city/region"
            value={formData?.institutionLocation || ''}
            onChange={(e) => onChange('institutionLocation', e?.target?.value)}
            required
          />
        </div>
      </div>
      {formData?.studentStatus === 'current' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Current Grade/Year"
            options={gradeYearOptions}
            value={formData?.currentGradeYear || ''}
            onChange={(value) => onChange('currentGradeYear', value)}
            required
          />
          
          <Select
            label="Field of Study"
            options={fieldOfStudyOptions}
            value={formData?.fieldOfStudy || ''}
            onChange={(value) => onChange('fieldOfStudy', value)}
            searchable
            required
          />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Academic Year Started"
          type="number"
          placeholder="e.g., 2020"
          value={formData?.academicYearStarted || ''}
          onChange={(e) => onChange('academicYearStarted', e?.target?.value)}
          min="1990"
          max="2025"
          required
        />
        
        {formData?.studentStatus === 'graduated' && (
          <Input
            label="Graduation Year"
            type="number"
            placeholder="e.g., 2024"
            value={formData?.graduationYear || ''}
            onChange={(e) => onChange('graduationYear', e?.target?.value)}
            min="1990"
            max="2025"
            required
          />
        )}
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Academic Performance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Current GPA/Average Grade"
            type="text"
            placeholder="e.g., 3.5 or A-"
            value={formData?.currentGPA || ''}
            onChange={(e) => onChange('currentGPA', e?.target?.value)}
          />
          
          <Checkbox
            label="Academic Scholarship Recipient"
            checked={formData?.scholarshipRecipient || false}
            onChange={(e) => onChange('scholarshipRecipient', e?.target?.checked)}
          />
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Basketball Program Participation</h4>
        <Checkbox
          label="Member of School Basketball Team"
          checked={formData?.schoolBasketballTeam || false}
          onChange={(e) => onChange('schoolBasketballTeam', e?.target?.checked)}
        />
        
        {formData?.schoolBasketballTeam && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <Input
              label="Team Name"
              type="text"
              placeholder="Enter school team name"
              value={formData?.schoolTeamName || ''}
              onChange={(e) => onChange('schoolTeamName', e?.target?.value)}
            />
            
            <Input
              label="Years on Team"
              type="number"
              placeholder="Enter years played"
              value={formData?.yearsOnSchoolTeam || ''}
              onChange={(e) => onChange('yearsOnSchoolTeam', e?.target?.value)}
              min="0"
              max="10"
            />
          </div>
        )}
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Academic Achievements</h4>
        <Input
          label="Academic Awards/Honors"
          type="text"
          placeholder="List any academic awards or honors received"
          value={formData?.academicAwards || ''}
          onChange={(e) => onChange('academicAwards', e?.target?.value)}
        />
        
        <Input
          label="Sports Achievements"
          type="text"
          placeholder="List basketball or other sports achievements"
          value={formData?.sportsAchievements || ''}
          onChange={(e) => onChange('sportsAchievements', e?.target?.value)}
        />
      </div>
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-foreground">Eligibility Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Checkbox
            label="Meets Academic Eligibility Requirements"
            checked={formData?.academicEligibility || false}
            onChange={(e) => onChange('academicEligibility', e?.target?.checked)}
            error={errors?.academicEligibility}
          />
          
          <Checkbox
            label="Full-time Student Status"
            checked={formData?.fullTimeStudent || false}
            onChange={(e) => onChange('fullTimeStudent', e?.target?.checked)}
          />
        </div>
      </div>
      <div className="space-y-4">
        <Input
          label="Academic Advisor/Contact Person"
          type="text"
          placeholder="Enter name of academic advisor or contact"
          value={formData?.academicAdvisor || ''}
          onChange={(e) => onChange('academicAdvisor', e?.target?.value)}
        />
        
        <Input
          label="Advisor Contact Information"
          type="text"
          placeholder="Enter phone number or email"
          value={formData?.advisorContact || ''}
          onChange={(e) => onChange('advisorContact', e?.target?.value)}
        />
      </div>
    </div>
  );
};

export default AcademicBackgroundForm;