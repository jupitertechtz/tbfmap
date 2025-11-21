# Local File Storage System

## Overview

The TBF system stores all team attachments (logos and documents) **locally** on the server and stores the file paths in the database. Files are NOT stored in Supabase Storage.

## File Storage Structure

Files are stored locally in the following directory structure:

```
api/uploads/
└── teams/
    ├── {teamId1}/
    │   ├── logo/
    │   │   └── {timestamp}-{random}-{filename}.png
    │   └── documents/
    │       ├── {timestamp}-{random}-registration-certificate.pdf
    │       ├── {timestamp}-{random}-tax-clearance.pdf
    │       └── ...
    ├── {teamId2}/
    │   ├── logo/
    │   └── documents/
    └── ...
```

## Database Storage

The `team_documents` table stores:

- **`file_path`** (PRIMARY): Local file path
  - Format: `teams/{teamId}/logo/{filename}` or `teams/{teamId}/documents/{filename}`
  - Example: `teams/2ff46b19-1030-47ec-a483-36cfeb16ac2f/logo/1763302708279-610r9jsrd-VIJANA-QUEENS.png`
  - This is the **primary** storage method

- **`file_url`** (Secondary): Full URL to access the file
  - Format: `http://localhost:3001/files/teams/{teamId}/logo/{filename}`
  - Used for backward compatibility and direct access
  - Can be generated from `file_path` using `teamService.getFileUrl(file_path)`

## How It Works

### 1. File Upload Flow

1. User selects a file in the frontend
2. Frontend calls `teamService.uploadFile(file, teamId, fileType)`
3. File is uploaded to local API: `POST http://localhost:3001/upload-team-file`
4. API saves file locally in `api/uploads/teams/{teamId}/logo/` or `api/uploads/teams/{teamId}/documents/`
5. API returns:
   - `filePath`: `teams/{teamId}/logo/{filename}` (stored in database)
   - `fileUrl`: `http://localhost:3001/files/teams/{teamId}/logo/{filename}` (for access)
6. Frontend calls `teamService.saveTeamDocument()` to save path to database

### 2. File Access

Files are served via the API server:
- URL: `http://localhost:3001/files/teams/{teamId}/logo/{filename}`
- The API uses `express.static()` to serve files from `api/uploads/` directory
- Files are accessible via HTTP GET requests

### 3. File Path Resolution

The `teamService.getFileUrl(filePath)` function:
- Takes a file path: `teams/{teamId}/logo/{filename}`
- Constructs full URL: `http://localhost:3001/files/teams/{teamId}/logo/{filename}`
- Used when displaying files in the UI

## API Endpoints

### POST `/upload-team-file`
Uploads a file to local storage.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: The file to upload
  - `teamId`: Team ID (UUID)
  - `fileType`: Either `'logo'` or `'document'`

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "fileName": "original-filename.png",
    "filePath": "teams/{teamId}/logo/{timestamp}-{random}-filename.png",
    "fileUrl": "http://localhost:3001/files/teams/{teamId}/logo/{filename}",
    "fileSize": 123456,
    "mimeType": "image/png"
  }
}
```

### GET `/files/{filePath}`
Serves uploaded files.

**Example:**
- `GET http://localhost:3001/files/teams/{teamId}/logo/{filename}`

### DELETE `/delete-file`
Deletes a file from local storage.

**Request:**
```json
{
  "filePath": "teams/{teamId}/logo/{filename}"
}
```

## Starting the File Upload Service

### Option 1: Combined Server (Recommended)
Runs both email and file upload services:

```bash
cd api
npm start
```

### Option 2: File Upload Service Only

```bash
cd api
npm run start:upload
```

## Configuration

### Environment Variables

In your `.env` file (or environment):

```env
# API Server URL (used by frontend)
VITE_API_URL=http://localhost:3001

# API Server Port (for backend)
PORT=3001
```

### Frontend Configuration

The frontend uses `VITE_API_URL` to determine where to upload files:
- Default: `http://localhost:3001`
- Production: Set to your deployed API URL

## File Organization

Files are organized by:
1. **Team ID**: Each team has its own folder
2. **File Type**: 
   - `logo/` - Team logos
   - `documents/` - Registration documents, certificates, etc.

This structure makes it easy to:
- Find files for a specific team
- Clean up files when a team is deleted
- Backup team-specific files
- Manage storage quotas per team

## Security Considerations

1. **File Validation**: 
   - File types are validated (images for logos, PDF/Word for documents)
   - File sizes are limited (5MB for logos, 10MB for documents)

2. **Path Security**: 
   - File paths are sanitized to prevent directory traversal
   - Only files within `api/uploads/` can be accessed

3. **Access Control**: 
   - Files are served via the API server
   - You can add authentication middleware if needed

## Migration from Supabase Storage

If you have existing files in Supabase Storage:

1. Download files from Supabase Storage
2. Upload them to local storage using the API
3. Update database records with new `file_path` values
4. Remove old Supabase Storage bucket (optional)

## Troubleshooting

### "Cannot connect to file upload server"
- Ensure the API server is running: `cd api && npm start`
- Check that `VITE_API_URL` is set correctly in your frontend `.env`

### "File not found" when accessing files
- Verify the file exists in `api/uploads/teams/{teamId}/logo/` or `api/uploads/teams/{teamId}/documents/`
- Check that the `file_path` in database matches the actual file location
- Ensure the API server is running and serving files from `/files` endpoint

### Files not saving to database
- Run migration: `supabase/migrations/20250116000000_add_file_path_to_team_documents.sql`
- Verify `file_path` column exists in `team_documents` table
- Check that `saveTeamDocument()` is being called after upload

