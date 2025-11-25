/**
 * Backend API Endpoint for Deleting Users
 * Uses the Supabase service role key to remove auth users and profile records.
 */

require('dotenv').config();

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            'x-client-info': 'tbfmap-delete-user-endpoint',
          },
        },
      })
    : null;

const relatedDeleteTables = [
  { table: 'players', column: 'user_profile_id' },
  { table: 'officials', column: 'user_profile_id' },
];

async function deleteUserDependencies(userId) {
  for (const { table, column } of relatedDeleteTables) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete({ count: 'exact' })
      .eq(column, userId);

    if (error && error.code !== 'PGRST116') {
      console.warn(`⚠️  Failed to delete related ${table} records for ${userId}:`, error.message);
    }
  }

  const { error: teamUpdateError } = await supabaseAdmin
    .from('teams')
    .update({ team_manager_id: null })
    .eq('team_manager_id', userId);

  if (teamUpdateError && teamUpdateError.code !== 'PGRST116') {
    console.warn('⚠️  Failed to detach team manager references:', teamUpdateError.message);
  }
}

async function deleteUserProfile(userId) {
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .delete({ count: 'exact' })
    .eq('id', userId);

  if (error && error.code !== 'PGRST116') {
    throw error;
  }
}

async function deleteAuthUser(userId) {
  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error && !error.message?.includes('not found')) {
    throw error;
  }
}

app.post('/delete-user', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(500).json({
        error: 'Admin client not configured',
        message: 'SUPABASE_SERVICE_ROLE_KEY is missing on the API server',
      });
    }

    const { userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId',
        message: 'Provide the userId of the account you want to delete',
      });
    }

    // Verify profile exists to provide better error messaging
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .maybeSingle();

    if (profileError && profileError.code !== 'PGRST116') {
      throw profileError;
    }

    if (!profile) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user profile exists with the provided ID',
      });
    }

    await deleteUserDependencies(userId);
    await deleteUserProfile(userId);
    await deleteAuthUser(userId);

    res.json({
      success: true,
      message: `User ${profile?.email || userId} deleted successfully`,
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      error: 'Failed to delete user',
      message: error?.message || 'Unexpected error deleting user',
    });
  }
});

module.exports = app;

