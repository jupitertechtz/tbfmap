/**
 * Email Service
 * Handles sending emails via Gmail SMTP
 * 
 * Note: For security, email sending should be done via a backend API endpoint.
 * This service provides the interface for sending invitation emails.
 */

const GMAIL_CONFIG = {
  email: 'tanzaniabasketball@gmail.com',
  password: 'tbf12345678910',
};

/**
 * Send user invitation email
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.fullName - Recipient full name
 * @param {string} params.email - Recipient email (same as to)
 * @param {string} params.password - Temporary password
 * @param {string} params.role - User role
 * @returns {Promise<Object>} Success response
 */
export const sendInvitationEmail = async ({ to, fullName, email, password, role, loginUrl }) => {
  try {
    // Get API URL from environment or use default
    // In production, set VITE_API_URL to your deployed API endpoint
    // e.g., VITE_API_URL=http://localhost:3001 or VITE_API_URL=https://api.yourdomain.com
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${apiUrl}/send-invitation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        fullName,
        email,
        password,
        role,
        loginUrl: loginUrl || `${window.location.origin}/login`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to send invitation email');
    }

    const result = await response.json();
    console.log('Invitation email sent successfully:', result);
    return result;
  } catch (error) {
    // Log error but don't fail user creation
    console.error('Email sending failed:', error.message);
    
    // In a production environment, you would want to:
    // 1. Queue the email for retry
    // 2. Log the error for monitoring
    // 3. Notify administrators
    
    // Re-throw the error so the caller can decide how to handle it
    throw new Error(`Failed to send invitation email: ${error.message}`);
  }
};

/**
 * Generate invitation email HTML content
 */
export const generateInvitationEmailHTML = ({ fullName, email, password, role, loginUrl }) => {
  const roleDisplay = role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Tanzania Basketball Federation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Tanzania Basketball Federation</h1>
    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Welcome to the TBF Management System</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${fullName}!</h2>
    
    <p>You have been invited to join the Tanzania Basketball Federation (TBF) Management System as a <strong>${roleDisplay}</strong>.</p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1f2937;">Your Account Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Email:</td>
          <td style="padding: 8px 0; color: #1f2937;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Temporary Password:</td>
          <td style="padding: 8px 0; color: #1f2937; font-family: monospace;">${password}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4b5563;">Role:</td>
          <td style="padding: 8px 0; color: #1f2937;">${roleDisplay}</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e;">
        <strong>⚠️ Important:</strong> Please change your password after your first login for security purposes.
      </p>
    </div>
    
    ${loginUrl ? `
    <div style="text-align: center; margin: 30px 0;">
      <a href="${loginUrl}" style="display: inline-block; background: #DC2626; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
        Login to Your Account
      </a>
    </div>
    ` : ''}
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      If you have any questions or need assistance, please contact the TBF administration team.
    </p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
      Best regards,<br>
      <strong>Tanzania Basketball Federation</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>This is an automated message. Please do not reply to this email.</p>
    <p>&copy; ${new Date().getFullYear()} Tanzania Basketball Federation. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generate invitation email plain text content
 */
export const generateInvitationEmailText = ({ fullName, email, password, role, loginUrl }) => {
  const roleDisplay = role?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return `
Welcome to Tanzania Basketball Federation!

Dear ${fullName},

You have been invited to join the Tanzania Basketball Federation (TBF) Management System as a ${roleDisplay}.

Your Account Details:
- Email: ${email}
- Temporary Password: ${password}
- Role: ${roleDisplay}

⚠️ Important: Please change your password after your first login for security purposes.

${loginUrl ? `Login to your account: ${loginUrl}` : ''}

If you have any questions or need assistance, please contact the TBF administration team.

Best regards,
Tanzania Basketball Federation

---
This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} Tanzania Basketball Federation. All rights reserved.
  `.trim();
};

/**
 * Send profile update notification email
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.fullName - User full name
 * @param {Object} params.changes - Object containing changed fields
 * @returns {Promise<Object>} Success response
 */
export const sendProfileUpdateEmail = async ({ to, fullName, changes }) => {
  try {
    // Get API URL from environment or use default
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${apiUrl}/send-profile-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        fullName,
        changes,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to send profile update email');
    }

    const result = await response.json();
    console.log('Profile update email sent successfully:', result);
    return result;
  } catch (error) {
    // Log error but don't fail profile update
    console.error('Email sending failed:', error.message);
    throw new Error(`Failed to send profile update email: ${error.message}`);
  }
};

/**
 * Generate profile update email HTML content
 */
export const generateProfileUpdateEmailHTML = ({ fullName, changes }) => {
  const changedFields = Object.keys(changes);
  const changeList = changedFields.map(field => {
    const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const oldValue = changes[field]?.old || 'Not set';
    const newValue = changes[field]?.new || 'Not set';
    return `
        <tr>
          <td style="padding: 8px 0; font-weight: bold; color: #4b5563; width: 40%;">${fieldLabel}:</td>
          <td style="padding: 8px 0; color: #1f2937;">
            <span style="text-decoration: line-through; color: #dc2626;">${oldValue}</span>
            <span style="margin: 0 8px;">→</span>
            <span style="color: #059669; font-weight: bold;">${newValue}</span>
          </td>
        </tr>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Profile Updated - Tanzania Basketball Federation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Tanzania Basketball Federation</h1>
    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Profile Update Notification</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Hello, ${fullName}!</h2>
    
    <p>Your profile information has been successfully updated in the Tanzania Basketball Federation (TBF) Management System.</p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #1f2937;">Updated Information:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${changeList}
      </table>
    </div>
    
    <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #1e40af;">
        <strong>ℹ️ Security Notice:</strong> If you did not make these changes, please contact the TBF administration team immediately and change your password.
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      If you have any questions or need assistance, please contact the TBF administration team.
    </p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
      Best regards,<br>
      <strong>Tanzania Basketball Federation</strong>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>This is an automated message. Please do not reply to this email.</p>
    <p>&copy; ${new Date().getFullYear()} Tanzania Basketball Federation. All rights reserved.</p>
  </div>
</body>
</html>
  `.trim();
};

/**
 * Generate profile update email plain text content
 */
export const generateProfileUpdateEmailText = ({ fullName, changes }) => {
  const changedFields = Object.keys(changes);
  const changeList = changedFields.map(field => {
    const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const oldValue = changes[field]?.old || 'Not set';
    const newValue = changes[field]?.new || 'Not set';
    return `- ${fieldLabel}: ${oldValue} → ${newValue}`;
  }).join('\n');

  return `
Profile Updated - Tanzania Basketball Federation

Hello, ${fullName}!

Your profile information has been successfully updated in the Tanzania Basketball Federation (TBF) Management System.

Updated Information:
${changeList}

ℹ️ Security Notice: If you did not make these changes, please contact the TBF administration team immediately and change your password.

If you have any questions or need assistance, please contact the TBF administration team.

Best regards,
Tanzania Basketball Federation

---
This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} Tanzania Basketball Federation. All rights reserved.
  `.trim();
};

/**
 * Send password reset email
 * @param {Object} params - Email parameters
 * @param {string} params.to - Recipient email address
 * @param {string} params.fullName - User full name (optional)
 * @param {string} params.resetUrl - Password reset URL
 * @returns {Promise<Object>} Success response
 */
export const sendPasswordResetEmail = async ({ to, fullName, resetUrl }) => {
  try {
    // Get API URL from environment or use default
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    
    const response = await fetch(`${apiUrl}/send-password-reset`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        fullName,
        resetUrl,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || 'Failed to send password reset email');
    }

    const result = await response.json();
    console.log('Password reset email sent successfully:', result);
    return result;
  } catch (error) {
    console.error('Email sending failed:', error.message);
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

export default {
  sendInvitationEmail,
  sendProfileUpdateEmail,
  sendPasswordResetEmail,
  generateInvitationEmailHTML,
  generateInvitationEmailText,
  generateProfileUpdateEmailHTML,
  generateProfileUpdateEmailText,
};

