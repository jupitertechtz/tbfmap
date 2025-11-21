# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the root directory of your project with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: Service Role Key (for admin user creation)
# ⚠️ SECURITY WARNING: This should NOT be used in production frontend code!
# The service role key has full admin access. Use it only in secure backend APIs.
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## How to Get Your Supabase Keys

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → `VITE_SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## Security Warning

⚠️ **IMPORTANT**: The `VITE_SUPABASE_SERVICE_ROLE_KEY` should **NEVER** be exposed in client-side code in production!

- It has full admin access to your database
- Anyone with access to your frontend code can see it
- It bypasses all Row-Level Security (RLS) policies

### Recommended Approach

For production, create a backend API endpoint that uses the service role key:

1. Create an API endpoint (e.g., `/api/create-user`) in your backend
2. Store the service role key in your backend environment (not frontend)
3. Have the frontend call this API endpoint instead of using the admin client directly

See `SECURE_USER_CREATION.md` for implementation details.

## Current Setup (Development Only)

For development/testing, you can set the service role key in `.env.local`:

```env
VITE_SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Remember**: 
- Never commit `.env.local` to version control
- Add `.env.local` to `.gitignore`
- Use backend API for production deployments

## File Location

Create `.env.local` in the project root:
```
tbfmap/
├── .env.local          ← Create this file here
├── src/
├── api/
└── ...
```

## After Setting Up

1. Restart your development server
2. The admin client will be available for user creation
3. You can create users from the User Management page

