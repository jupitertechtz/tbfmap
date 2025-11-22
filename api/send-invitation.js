/**
 * Backend API Endpoint for Sending Invitation Emails
 * 
 * This is a Node.js/Express endpoint that can be deployed separately
 * or integrated into your backend server.
 * 
 * To use this:
 * 1. Install dependencies: npm install express nodemailer cors dotenv
 * 2. Set environment variables or update GMAIL_CONFIG below
 * 3. Deploy this as a separate service or integrate into your backend
 */

// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Gmail SMTP Configuration
// IMPORTANT: Use Gmail App Password, not your regular password!
// See README.md for instructions on how to generate an App Password
const GMAIL_CONFIG = {
  email: process.env.GMAIL_EMAIL || 'tanzaniabasketball@gmail.com',
  password: process.env.GMAIL_PASSWORD || '',
};

// Validate configuration
if (!GMAIL_CONFIG.password) {
  console.error('⚠️  ERROR: GMAIL_PASSWORD is not set in .env file!');
  console.error('Please create a .env file with your Gmail App Password.');
  console.error('See GMAIL_APP_PASSWORD_SETUP.md for instructions.');
}

// Create reusable transporter object using Gmail SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: GMAIL_CONFIG.email,
    pass: GMAIL_CONFIG.password,
  },
});

// Email template
const generateEmailHTML = ({ fullName, email, password, role, loginUrl }) => {
  const roleDisplay = role.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  
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

// API endpoint
app.post('/send-invitation', async (req, res) => {
  try {
    const { to, fullName, email, password, role, loginUrl } = req.body;

    // Validate required fields
    if (!to || !fullName || !email || !password || !role) {
      return res.status(400).json({
        error: 'Missing required fields: to, fullName, email, password, role',
      });
    }

    // Generate email content
    const htmlContent = generateEmailHTML({ fullName, email, password, role, loginUrl });

    // Send email
    const info = await transporter.sendMail({
      from: `"Tanzania Basketball Federation" <${GMAIL_CONFIG.email}>`,
      to: to,
      subject: 'Welcome to Tanzania Basketball Federation - Account Invitation',
      html: htmlContent,
      text: `Welcome to Tanzania Basketball Federation!\n\nDear ${fullName},\n\nYou have been invited to join the TBF Management System as a ${role.replace(/_/g, ' ')}.\n\nYour Account Details:\n- Email: ${email}\n- Temporary Password: ${password}\n- Role: ${role.replace(/_/g, ' ')}\n\n⚠️ Important: Please change your password after your first login.\n\n${loginUrl ? `Login: ${loginUrl}` : ''}\n\nBest regards,\nTanzania Basketball Federation`,
    });

    console.log('Email sent successfully:', info.messageId);

    res.json({
      success: true,
      message: 'Invitation email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({
      error: 'Failed to send invitation email',
      message: error.message,
    });
  }
});

// Email template for profile updates
const generateProfileUpdateEmailHTML = ({ fullName, changes }) => {
  const changedFields = Object.keys(changes);
  const changeList = changedFields.map(field => {
    const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
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

// API endpoint for profile update notifications
app.post('/send-profile-update', async (req, res) => {
  try {
    const { to, fullName, changes } = req.body;

    // Validate required fields
    if (!to || !fullName || !changes || Object.keys(changes).length === 0) {
      return res.status(400).json({
        error: 'Missing required fields: to, fullName, changes',
      });
    }

    // Generate email content
    const htmlContent = generateProfileUpdateEmailHTML({ fullName, changes });

    // Generate plain text version
    const changedFields = Object.keys(changes);
    const changeList = changedFields.map(field => {
      const fieldLabel = field.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const oldValue = changes[field]?.old || 'Not set';
      const newValue = changes[field]?.new || 'Not set';
      return `${fieldLabel}: ${oldValue} → ${newValue}`;
    }).join('\n');

    const textContent = `
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

    // Send email
    const info = await transporter.sendMail({
      from: `"Tanzania Basketball Federation" <${GMAIL_CONFIG.email}>`,
      to: to,
      subject: 'Profile Updated - Tanzania Basketball Federation',
      html: htmlContent,
      text: textContent,
    });

    console.log('Profile update email sent successfully:', info.messageId);

    res.json({
      success: true,
      message: 'Profile update email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending profile update email:', error);
    res.status(500).json({
      error: 'Failed to send profile update email',
      message: error.message,
    });
  }
});

// Email template for password reset
const generatePasswordResetEmailHTML = ({ fullName, resetUrl, expiresIn = '1 hour' }) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Tanzania Basketball Federation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #DC2626 0%, #991B1B 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Tanzania Basketball Federation</h1>
    <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Password Reset Request</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
    <h2 style="color: #1f2937; margin-top: 0;">Hello${fullName ? `, ${fullName}` : ''}!</h2>
    
    <p>We received a request to reset your password for your Tanzania Basketball Federation (TBF) Management System account.</p>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
      <p style="margin: 0; color: #1f2937; font-weight: 500;">You will receive a separate email with a secure password reset link. Please use that link to reset your password.</p>
    </div>
    
    <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>📧 Next Steps:</strong>
      </p>
      <ol style="margin: 10px 0 0 0; padding-left: 20px; color: #1e40af; font-size: 14px;">
        <li>Check your email inbox for a password reset link</li>
        <li>Click the secure reset link in that email</li>
        <li>Create your new password</li>
        <li>Sign in with your new password</li>
      </ol>
    </div>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e;">
        <strong>⚠️ Important Security Information:</strong>
      </p>
      <ul style="margin: 10px 0 0 0; padding-left: 20px; color: #92400e;">
        <li>This link will expire in ${expiresIn}</li>
        <li>If you didn't request this, please ignore this email</li>
        <li>Your password will not change until you click the link above</li>
        <li>For security, never share this link with anyone</li>
      </ul>
    </div>
    
    <div style="background: #e0e7ff; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #1e40af; font-size: 14px;">
        <strong>💡 Tip:</strong> If the button doesn't work, copy and paste this link into your browser:
      </p>
      <p style="margin: 5px 0 0 0; color: #1e40af; font-size: 12px; word-break: break-all;">
        ${resetUrl}
      </p>
    </div>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      If you have any questions or need assistance, please contact the TBF administration team.
    </p>
    
    <p style="color: #6b7280; font-size: 14px; margin-top: 10px;">
      Best regards,<br>
      <strong>Tanzania Basketball Federation</strong><br>
      <span style="font-size: 12px;">IT Support Team</span>
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px; padding: 20px; color: #9ca3af; font-size: 12px;">
    <p>This is an automated message. Please do not reply to this email.</p>
    <p>&copy; ${new Date().getFullYear()} Tanzania Basketball Federation. All rights reserved.</p>
    <p style="margin-top: 10px;">
      <a href="https://tbf.or.tz" style="color: #9ca3af; text-decoration: none;">Visit TBF Website</a>
    </p>
  </div>
</body>
</html>
  `.trim();
};

// API endpoint for password reset emails
app.post('/send-password-reset', async (req, res) => {
  try {
    const { to, fullName, resetUrl } = req.body;

    // Validate required fields
    if (!to || !resetUrl) {
      return res.status(400).json({
        error: 'Missing required fields: to, resetUrl',
      });
    }

    // Generate email content
    const htmlContent = generatePasswordResetEmailHTML({ 
      fullName: fullName || 'User',
      resetUrl,
      expiresIn: '1 hour'
    });

    // Generate plain text version
    const textContent = `
Reset Your Password - Tanzania Basketball Federation

Hello${fullName ? `, ${fullName}` : ''}!

We received a request to reset your password for your Tanzania Basketball Federation (TBF) Management System account.

You will receive a separate email with a secure password reset link. Please use that link to reset your password.

📧 Next Steps:
1. Check your email inbox for a password reset link
2. Click the secure reset link in that email
3. Create your new password
4. Sign in with your new password

⚠️ Important Security Information:
- The reset link will expire in 1 hour
- If you didn't request this, please ignore this email
- Your password will not change until you use the reset link
- For security, never share the reset link with anyone

If you have any questions or need assistance, please contact the TBF administration team.

Best regards,
Tanzania Basketball Federation
IT Support Team

---
This is an automated message. Please do not reply to this email.
© ${new Date().getFullYear()} Tanzania Basketball Federation. All rights reserved.
    `.trim();

    // Send email
    const info = await transporter.sendMail({
      from: `"Tanzania Basketball Federation" <${GMAIL_CONFIG.email}>`,
      to: to,
      subject: 'Reset Your Password - Tanzania Basketball Federation',
      html: htmlContent,
      text: textContent,
    });

    console.log('Password reset email sent successfully:', info.messageId);

    res.json({
      success: true,
      message: 'Password reset email sent successfully',
      messageId: info.messageId,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({
      error: 'Failed to send password reset email',
      message: error.message,
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'email-api' });
});

// Import file upload routes (if separate file, otherwise keep everything in one file)
// For now, we'll keep email and file upload in separate files
// You can run them separately or combine them

// Start server (only if this file is run directly)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Email API server running on port ${PORT}`);
    console.log(`Gmail configured: ${GMAIL_CONFIG.email}`);
    if (GMAIL_CONFIG.password) {
      console.log(`Gmail password: ${GMAIL_CONFIG.password.length} characters (loaded from ${process.env.GMAIL_PASSWORD ? '.env' : 'default'})`);
    } else {
      console.error('⚠️  WARNING: Gmail password not configured!');
      console.error('   Create a .env file with GMAIL_PASSWORD=your-app-password');
    }
  });
}

module.exports = app;

