import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const BankingInformation = ({ formData, handleInputChange, errors }) => {
  const bankOptions = [
    { value: 'crdb', label: 'CRDB Bank' },
    { value: 'nbc', label: 'National Bank of Commerce (NBC)' },
    { value: 'nmb', label: 'NMB Bank' },
    { value: 'exim', label: 'Exim Bank Tanzania' },
    { value: 'stanbic', label: 'Stanbic Bank' },
    { value: 'standard-chartered', label: 'Standard Chartered Bank' },
    { value: 'citibank', label: 'Citibank Tanzania' },
    { value: 'access', label: 'Access Bank Tanzania' },
    { value: 'azania', label: 'Azania Bank' },
    { value: 'diamond-trust', label: 'Diamond Trust Bank' }
  ];

  const accountTypeOptions = [
    { value: 'current', label: 'Current Account' },
    { value: 'savings', label: 'Savings Account' },
    { value: 'business', label: 'Business Account' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Icon name="CreditCard" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Banking Information</h3>
            <p className="text-sm text-muted-foreground">Provide banking details for transactions and prize distribution</p>
          </div>
        </div>
      </div>
      <div className="p-6">
      <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-accent mt-0.5" />
          <div className="text-sm text-accent">
            <p className="font-medium">Secure Banking Details</p>
            <p className="mt-1">
              Banking information is required for prize money distribution and fee transactions. 
              All data is encrypted and stored securely according to TBF regulations.
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Account Holder Name"
          type="text"
          name="accountHolderName"
          placeholder="Enter account holder name"
          value={formData?.accountHolderName}
          onChange={handleInputChange}
          error={errors?.accountHolderName}
          description="Must match team registration name"
          required
        />

        <Select
          label="Bank Name"
          name="bankName"
          options={bankOptions}
          value={formData?.bankName}
          onChange={(value) => handleInputChange({ target: { name: 'bankName', value } })}
          error={errors?.bankName}
          placeholder="Select bank"
          searchable
          required
        />

        <Input
          label="Account Number"
          type="text"
          name="accountNumber"
          placeholder="Enter account number"
          value={formData?.accountNumber}
          onChange={handleInputChange}
          error={errors?.accountNumber}
          required
        />

        <Select
          label="Account Type"
          name="accountType"
          options={accountTypeOptions}
          value={formData?.accountType}
          onChange={(value) => handleInputChange({ target: { name: 'accountType', value } })}
          error={errors?.accountType}
          placeholder="Select account type"
          required
        />

        <Input
          label="Branch Name"
          type="text"
          name="branchName"
          placeholder="Enter branch name"
          value={formData?.branchName}
          onChange={handleInputChange}
          error={errors?.branchName}
          required
        />

        <Input
          label="Branch Code"
          type="text"
          name="branchCode"
          placeholder="Enter branch code"
          value={formData?.branchCode}
          onChange={handleInputChange}
          error={errors?.branchCode}
          description="4-digit branch code"
          maxLength={4}
        />

        <Input
          label="SWIFT Code"
          type="text"
          name="swiftCode"
          placeholder="Enter SWIFT/BIC code"
          value={formData?.swiftCode}
          onChange={handleInputChange}
          error={errors?.swiftCode}
          description="For international transactions"
          className="col-span-1 md:col-span-2"
        />
      </div>
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-start space-x-2">
          <Icon name="Shield" size={16} className="text-success mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-foreground">Data Security</p>
            <p className="text-muted-foreground mt-1">
              Your banking information is protected with bank-level encryption and is only accessible 
              to authorized TBF financial personnel for legitimate transactions.
            </p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default BankingInformation;