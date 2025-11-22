/**
 * Backend API Endpoint for File Uploads
 * 
 * This endpoint handles file uploads and stores them locally on the server.
 * Files are organized by team ID and file type.
 * 
 * To use this:
 * 1. Install dependencies: npm install express multer cors dotenv
 * 2. Create uploads directory structure
 * 3. Configure file serving
 */

require('dotenv').config();

const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

// Configure uploads directory
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const TEAMS_DIR = path.join(UPLOADS_DIR, 'teams');
const PLAYERS_DIR = path.join(UPLOADS_DIR, 'players');
const LEAGUES_DIR = path.join(UPLOADS_DIR, 'leagues');
const OFFICIALS_DIR = path.join(UPLOADS_DIR, 'officials');

// Ensure directories exist
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
if (!fs.existsSync(TEAMS_DIR)) {
  fs.mkdirSync(TEAMS_DIR, { recursive: true });
}
if (!fs.existsSync(PLAYERS_DIR)) {
  fs.mkdirSync(PLAYERS_DIR, { recursive: true });
}
if (!fs.existsSync(LEAGUES_DIR)) {
  fs.mkdirSync(LEAGUES_DIR, { recursive: true });
}
if (!fs.existsSync(OFFICIALS_DIR)) {
  fs.mkdirSync(OFFICIALS_DIR, { recursive: true });
}

// Configure multer for file uploads
// Note: req.body is not available in destination callback, so we upload to temp first
const TEMP_DIR = path.join(UPLOADS_DIR, 'temp');
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Upload to temp directory first, we'll move it after we have teamId from req.body
    cb(null, TEMP_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-random-originalname
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 11);
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(sanitizedName, ext);
    
    const filename = `${timestamp}-${randomStr}-${nameWithoutExt}${ext}`;
    cb(null, filename);
  }
});

// File filter - validate file types and sizes
const fileFilter = (req, file, cb) => {
  const { fileType } = req.body;
  
  // Logo validation
  if (fileType === 'logo') {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Logo must be an image file (JPEG, PNG, GIF, or WebP)'));
    }
    // Max 5MB for logos
    if (file.size > 5 * 1024 * 1024) {
      return cb(new Error('Logo file size must be less than 5MB'));
    }
  } else {
    // Document validation
    const allowedMimes = [
      'application/pdf',
      'image/jpeg', 'image/jpg', 'image/png',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      return cb(new Error('Document must be PDF, image, or Word document'));
    }
    // Max 10MB for documents
    if (file.size > 10 * 1024 * 1024) {
      return cb(new Error('Document file size must be less than 10MB'));
    }
  }
  
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
});

// Error handling middleware for multer errors
const handleMulterError = (err, req, res, next) => {
  if (err) {
    console.error('Multer error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: err.message || 'File size exceeds the maximum allowed size'
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field',
        message: err.message || 'Unexpected file field name'
      });
    }
    return res.status(400).json({
      error: 'File upload error',
      message: err.message || 'An error occurred while processing the file'
    });
  }
  next();
};

// File upload endpoint
app.post('/upload-team-file', upload.single('file'), handleMulterError, (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    tempFilePath = req.file.path; // Store temp path for cleanup if needed

    const { teamId, fileType } = req.body;
    
    if (!teamId) {
      // Delete uploaded file if teamId is missing
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({
        error: 'Team ID is required',
        message: 'Team ID must be provided in the request body'
      });
    }

    // Create final directory structure: uploads/teams/{teamId}/logo or uploads/teams/{teamId}/documents
    const folder = fileType === 'logo' ? 'logo' : 'documents';
    const teamDir = path.join(TEAMS_DIR, teamId, folder);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(teamDir)) {
      fs.mkdirSync(teamDir, { recursive: true });
    }

    // Move file from temp to final location
    const finalFilePath = path.join(teamDir, req.file.filename);
    fs.renameSync(tempFilePath, finalFilePath);
    tempFilePath = null; // Clear temp path since file is moved

    // Generate file path relative to uploads directory
    // Path format: teams/{teamId}/logo/{filename} or teams/{teamId}/documents/{filename}
    const relativePath = `teams/${teamId}/${folder}/${req.file.filename}`;
    
    // Generate URL to access the file
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const fileUrl = `${apiUrl}/files/${relativePath}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        fileName: req.file.originalname,
        filePath: relativePath, // Store this in database: teams/{teamId}/logo/{filename}
        fileUrl: fileUrl,       // URL to access the file
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request details:', {
      hasFile: !!req.file,
      filePath: req.file?.path,
      teamId: req.body?.teamId,
      fileType: req.body?.fileType,
      fileName: req.file?.originalname,
      fileSize: req.file?.size
    });
    
    // Clean up uploaded file if there was an error
    // Use tempFilePath if available, otherwise use req.file.path
    const fileToDelete = tempFilePath || req.file?.path;
    if (fileToDelete && fs.existsSync(fileToDelete)) {
      try {
        fs.unlinkSync(fileToDelete);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      error: 'Failed to upload file',
      message: error.message || 'An error occurred while uploading the file',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Serve uploaded files
app.use('/files', express.static(UPLOADS_DIR, {
  setHeaders: (res, filePath) => {
    // Set appropriate headers for file serving
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    }
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'file-upload-api',
    uploadsDir: UPLOADS_DIR
  });
});

// Player file upload endpoint (similar to team upload)
app.post('/upload-player-file', upload.single('file'), handleMulterError, (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    tempFilePath = req.file.path; // Store temp path for cleanup if needed

    const { playerId, fileType } = req.body;
    
    if (!playerId) {
      // Delete uploaded file if playerId is missing
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({
        error: 'Player ID is required',
        message: 'Player ID must be provided in the request body'
      });
    }

    // Create final directory structure: uploads/players/{playerId}/photo or uploads/players/{playerId}/documents
    const folder = fileType === 'photo' ? 'photo' : 'documents';
    const playerDir = path.join(PLAYERS_DIR, playerId, folder);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(playerDir)) {
      fs.mkdirSync(playerDir, { recursive: true });
    }

    // Move file from temp to final location
    const finalFilePath = path.join(playerDir, req.file.filename);
    fs.renameSync(tempFilePath, finalFilePath);
    tempFilePath = null; // Clear temp path since file is moved

    // Generate file path relative to uploads directory
    // Path format: players/{playerId}/photo/{filename} or players/{playerId}/documents/{filename}
    const relativePath = `players/${playerId}/${folder}/${req.file.filename}`;
    
    // Generate URL to access the file
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const fileUrl = `${apiUrl}/files/${relativePath}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        fileName: req.file.originalname,
        filePath: relativePath, // Store this in database: players/{playerId}/photo/{filename}
        fileUrl: fileUrl,       // URL to access the file
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Player file upload error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request details:', {
      hasFile: !!req.file,
      filePath: req.file?.path,
      playerId: req.body?.playerId,
      fileType: req.body?.fileType,
      fileName: req.file?.originalname,
      fileSize: req.file?.size
    });
    
    // Clean up uploaded file if there was an error
    // Use tempFilePath if available, otherwise use req.file.path
    const fileToDelete = tempFilePath || req.file?.path;
    if (fileToDelete && fs.existsSync(fileToDelete)) {
      try {
        fs.unlinkSync(fileToDelete);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      error: 'Failed to upload file',
      message: error.message || 'An error occurred while uploading the file',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// League file upload endpoint
app.post('/upload-league-file', upload.single('file'), handleMulterError, (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    tempFilePath = req.file.path; // Store temp path for cleanup if needed

    const { leagueId, fileType } = req.body;
    
    if (!leagueId) {
      // Delete uploaded file if leagueId is missing
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({
        error: 'League ID is required',
        message: 'League ID must be provided in the request body'
      });
    }

    // Create final directory structure: uploads/leagues/{leagueId}/documents
    const folder = 'documents';
    const leagueDir = path.join(LEAGUES_DIR, leagueId, folder);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(leagueDir)) {
      fs.mkdirSync(leagueDir, { recursive: true });
    }

    // Move file from temp to final location
    const finalFilePath = path.join(leagueDir, req.file.filename);
    fs.renameSync(tempFilePath, finalFilePath);
    tempFilePath = null; // Clear temp path since file is moved

    // Generate file path relative to uploads directory
    // Path format: leagues/{leagueId}/documents/{filename}
    const relativePath = `leagues/${leagueId}/${folder}/${req.file.filename}`;
    
    // Generate URL to access the file
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const fileUrl = `${apiUrl}/files/${relativePath}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        fileName: req.file.originalname,
        filePath: relativePath, // Store this in database: leagues/{leagueId}/documents/{filename}
        fileUrl: fileUrl,       // URL to access the file
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('League file upload error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request details:', {
      hasFile: !!req.file,
      filePath: req.file?.path,
      leagueId: req.body?.leagueId,
      fileType: req.body?.fileType,
      fileName: req.file?.originalname,
      fileSize: req.file?.size
    });
    
    // Clean up uploaded file if there was an error
    const fileToDelete = tempFilePath || req.file?.path;
    if (fileToDelete && fs.existsSync(fileToDelete)) {
      try {
        fs.unlinkSync(fileToDelete);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      error: 'Failed to upload file',
      message: error.message || 'An error occurred while uploading the file',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Official file upload endpoint
app.post('/upload-official-file', upload.single('file'), handleMulterError, (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      });
    }

    tempFilePath = req.file.path; // Store temp path for cleanup if needed

    const { officialId, fileType } = req.body;
    
    if (!officialId) {
      // Delete uploaded file if officialId is missing
      if (tempFilePath && fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
      return res.status(400).json({
        error: 'Official ID is required',
        message: 'Official ID must be provided in the request body'
      });
    }

    // Create final directory structure: uploads/officials/{officialId}/photo
    const folder = fileType === 'photo' ? 'photo' : 'documents';
    const officialDir = path.join(OFFICIALS_DIR, officialId, folder);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(officialDir)) {
      fs.mkdirSync(officialDir, { recursive: true });
    }

    // Move file from temp to final location
    const finalFilePath = path.join(officialDir, req.file.filename);
    fs.renameSync(tempFilePath, finalFilePath);
    tempFilePath = null; // Clear temp path since file is moved

    // Generate file path relative to uploads directory
    // Path format: officials/{officialId}/photo/{filename}
    const relativePath = `officials/${officialId}/${folder}/${req.file.filename}`;
    
    // Generate URL to access the file
    const apiUrl = process.env.API_URL || 'http://localhost:3001';
    const fileUrl = `${apiUrl}/files/${relativePath}`;

    res.json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        fileName: req.file.originalname,
        filePath: relativePath, // Store this in database: officials/{officialId}/photo/{filename}
        fileUrl: fileUrl,       // URL to access the file
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Official file upload error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request details:', {
      hasFile: !!req.file,
      filePath: req.file?.path,
      officialId: req.body?.officialId,
      fileType: req.body?.fileType,
      fileName: req.file?.originalname,
      fileSize: req.file?.size
    });
    
    // Clean up uploaded file if there was an error
    const fileToDelete = tempFilePath || req.file?.path;
    if (fileToDelete && fs.existsSync(fileToDelete)) {
      try {
        fs.unlinkSync(fileToDelete);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }
    
    res.status(500).json({
      error: 'Failed to upload file',
      message: error.message || 'An error occurred while uploading the file',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Delete file endpoint
app.delete('/delete-file', (req, res) => {
  try {
    const { filePath } = req.body;
    
    if (!filePath) {
      return res.status(400).json({
        error: 'File path is required'
      });
    }

    const fullPath = path.join(UPLOADS_DIR, filePath);
    
    // Security check: ensure file is within uploads directory
    const resolvedPath = path.resolve(fullPath);
    const resolvedUploadsDir = path.resolve(UPLOADS_DIR);
    
    if (!resolvedPath.startsWith(resolvedUploadsDir)) {
      return res.status(403).json({
        error: 'Invalid file path',
        message: 'File path must be within the uploads directory'
      });
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        error: 'File not found'
      });
    }

    // Delete file
    fs.unlinkSync(fullPath);
    
    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    console.error('File deletion error:', error);
    res.status(500).json({
      error: 'Failed to delete file',
      message: error.message
    });
  }
});

// Only start server if run directly (not when required as module)
// This allows the file to be used in server.js without starting a duplicate server
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`File Upload API server running on port ${PORT}`);
    console.log(`Uploads directory: ${UPLOADS_DIR}`);
    console.log(`Files will be served at: http://localhost:${PORT}/files/`);
  });
}

module.exports = app;

