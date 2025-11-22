# How to Get Your Supabase Keys

## Steps to Get Service Role Key

1. **Go to Supabase Dashboard**
   - Visit: https://app.supabase.com
   - Sign in to your account

2. **Select Your Project**
   - Choose the project you're using for TBF

3. **Navigate to API Settings**
   - Click on **Settings** (gear icon in left sidebar)
   - Click on **API** in the settings menu

4. **Copy the Required Values**

   You'll see several sections. Copy these values:

   ### Project URL
   - Look for **Project URL** or **API URL**
   - Example: `https://xxxxxxxxxxxxx.supabase.co`
   - Copy this to `SUPABASE_URL` in `api/.env`

   ### Service Role Key (Secret)
   - Look for **service_role** key (⚠️ This is secret!)
   - It's usually a long string starting with `eyJ...`
   - Click the **eye icon** to reveal it
   - Copy this to `SUPABASE_SERVICE_ROLE_KEY` in `api/.env`

## Example .env File

After adding the keys, your `api/.env` should look like:

```env
GMAIL_EMAIL=tanzaniabasketball@gmail.com
GMAIL_PASSWORD=rvnwrwamyvumlash
PORT=3001

# Supabase Configuration
SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh4eHh4eHh4eHh4eHh4eHh4eHgiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQxMjM0NTY3LCJleHAiOjE5NTY4MTA1Njd9.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Security Reminders

⚠️ **IMPORTANT**:
- Never commit `.env` to version control
- Never share your service role key publicly
- The service role key bypasses all security policies
- Keep it secure and only use it in backend code

## After Adding Keys

1. Save the `.env` file
2. Restart the API server:
   ```bash
   cd api
   npm start
   ```
3. You should see: `User creation service: Available`
4. Try creating a user from the User Management page

