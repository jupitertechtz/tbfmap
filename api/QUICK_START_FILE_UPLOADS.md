# Quick Start: File Upload Service

## Installation

```bash
cd api
npm install
```

This will install `multer` for file uploads.

## Start the Server

**Option 1: Combined Server (Recommended)**
Runs both email and file upload services:

```bash
npm start
```

**Option 2: File Upload Only**

```bash
npm run start:upload
```

## File Storage Location

Files are stored in: `api/uploads/teams/{teamId}/logo/` or `api/uploads/teams/{teamId}/documents/`

The directory structure is created automatically when files are uploaded.

## Accessing Files

Once uploaded, files are accessible at:
- `https://tbfmap-production.up.railway.app/files/teams/{teamId}/logo/{filename}`
- `https://tbfmap-production.up.railway.app/files/teams/{teamId}/documents/{filename}`

## Database Storage

The `file_path` column in `team_documents` table stores:
- `teams/{teamId}/logo/{filename}` for logos
- `teams/{teamId}/documents/{filename}` for documents

The full URL is constructed as: `{API_URL}/files/{file_path}`

## Next Steps

1. Ensure the migration `20250116000000_add_file_path_to_team_documents.sql` has been run
2. Start the API server
3. Upload files through the team management page

