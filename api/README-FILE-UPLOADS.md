# File Upload API Service

This API service handles file uploads for team logos and documents, storing them locally on the server.

## Setup Instructions

### 1. Install Dependencies

```bash
cd api
npm install
```

This will install:
- `express` - Web server framework
- `multer` - File upload middleware
- `cors` - Cross-origin resource sharing
- `dotenv` - Environment variable management

### 2. Create Uploads Directory

The uploads directory will be created automatically when the server starts, but you can create it manually:

```bash
mkdir -p api/uploads/teams
```

### 3. Start the Server

**Option A: Combined Server (Recommended)**
Runs both email and file upload services:

```bash
npm start
# or for development
npm run dev
```

**Option B: File Upload Service Only**

```bash
npm run start:upload
# or for development
npm run dev:upload
```

The server will run on `https://tbfmap-production.up.railway.app` by default.

### 4. Configure Frontend

In your frontend `.env.local` file, ensure:

```env
VITE_API_URL=https://tbfmap-production.up.railway.app
```

For production, update to your deployed API URL:
```env
VITE_API_URL=https://api.yourdomain.com
```

## File Storage Structure

Files are stored locally in the following structure:

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

## API Endpoints

### POST `/upload-team-file`

Uploads a file for a team.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body:
  - `file`: The file to upload (required)
  - `teamId`: Team ID (required)
  - `fileType`: Either `'logo'` or `'document'` (required)

**Response:**
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "file": {
    "fileName": "original-filename.png",
    "filePath": "teams/{teamId}/logo/{timestamp}-{random}-filename.png",
    "fileUrl": "https://tbfmap-production.up.railway.app/files/teams/{teamId}/logo/{filename}",
    "fileSize": 123456,
    "mimeType": "image/png"
  }
}
```

### GET `/files/{filePath}`

Serves uploaded files. Files are accessible via:
```
https://tbfmap-production.up.railway.app/files/teams/{teamId}/logo/{filename}
https://tbfmap-production.up.railway.app/files/teams/{teamId}/documents/{filename}
```

### DELETE `/delete-file`

Deletes a file from the server.

**Request:**
```json
{
  "filePath": "teams/{teamId}/logo/{filename}"
}
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

### GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "file-upload-api",
  "uploadsDir": "/path/to/uploads"
}
```

## File Validation

### Logos
- Allowed types: JPEG, PNG, GIF, WebP
- Max size: 5MB

### Documents
- Allowed types: PDF, JPEG, PNG, Word documents (.doc, .docx)
- Max size: 10MB

## Security Considerations

1. **File Path Validation**: The delete endpoint validates that file paths are within the uploads directory to prevent directory traversal attacks.

2. **File Type Validation**: Only allowed file types are accepted.

3. **File Size Limits**: Enforced on both client and server side.

4. **Directory Structure**: Files are organized by team ID to prevent conflicts and enable easy cleanup.

## Database Storage

The file path stored in the database follows this format:
- `teams/{teamId}/logo/{filename}` for logos
- `teams/{teamId}/documents/{filename}` for documents

The full URL to access the file is:
- `{API_URL}/files/teams/{teamId}/logo/{filename}`

## Production Deployment

### 1. Set Environment Variables

Create a `.env` file:

```env
PORT=3001
API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### 2. Serve Static Files

Ensure your web server (nginx, Apache, etc.) can serve files from the `uploads` directory, or use the built-in Express static file serving.

### 3. Backup Strategy

Regularly backup the `uploads` directory as it contains user-uploaded files.

### 4. Storage Limits

Monitor disk space usage. Consider implementing:
- File cleanup for old/unused files
- Storage quotas per team
- Automatic archiving

## Troubleshooting

### "Cannot connect to file upload server"
- Ensure the API server is running
- Check that `VITE_API_URL` is set correctly in frontend
- Verify the port (default: 3001) is not blocked

### "File upload failed"
- Check file size (max 5MB for logos, 10MB for documents)
- Verify file type is allowed
- Check server logs for detailed error messages

### "Permission denied"
- Ensure the `uploads` directory has write permissions
- On Linux/Mac: `chmod -R 755 api/uploads`
- On Windows: Check folder permissions in Properties

### Files not accessible
- Verify the `/files` route is configured
- Check that files are being saved to the correct directory
- Ensure the API server is running and accessible

