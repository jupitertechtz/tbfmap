/**
 * Utility script to permanently delete Supabase users by email.
 * Usage:
 *   node scripts/delete-users.js user1@example.com user2@example.com
 *
 * Steps:
 *   1. Lookup the user in user_profiles (case-insensitive).
 *   2. Remove dependent records (players, officials, etc.).
 *   3. Null-out team manager references.
 *   4. Delete the user_profile row.
 *   5. Delete the Auth user via Supabase Admin API.
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const emails = process.argv.slice(2);

if (!emails.length) {
  console.error('❌  Please provide at least one email to delete.');
  console.error('    Example: node scripts/delete-users.js user@example.com');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌  Missing Supabase credentials.');
  console.error('    Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in api/.env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  global: {
    headers: {
      'x-client-info': 'tbfmap-delete-users-script',
    },
  },
});

const relatedDeleteTables = [
  { table: 'players', column: 'user_profile_id' },
  { table: 'officials', column: 'user_profile_id' },
];

async function findProfileByEmail(email) {
  const { data, error } = await supabaseAdmin
    .from('user_profiles')
    .select('id, email, full_name, role')
    .ilike('email', email)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

async function findAuthUserByEmail(email) {
  const perPage = 1000;
  let page = 1;

  while (true) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) {
      throw error;
    }

    const users = data?.users || [];
    const match = users.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase()
    );

    if (match) {
      return match;
    }

    if (users.length < perPage) {
      break;
    }

    page += 1;
  }

  return null;
}

async function deleteUserProfileDependencies(userId) {
  for (const { table, column } of relatedDeleteTables) {
    const { error } = await supabaseAdmin
      .from(table)
      .delete({ count: 'exact' })
      .eq(column, userId);

    if (error && error.code !== 'PGRST116') {
      console.warn(`⚠️  Skipped deleting from ${table}:`, error.message);
    }
  }

  const { error: teamUpdateError } = await supabaseAdmin
    .from('teams')
    .update({ team_manager_id: null })
    .eq('team_manager_id', userId);

  if (teamUpdateError && teamUpdateError.code !== 'PGRST116') {
    console.warn('⚠️  Failed to detach teams from user:', teamUpdateError.message);
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
  if (error) {
    throw error;
  }
}

async function deleteUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();
  console.log(`\n🗑️  Deleting user: ${normalizedEmail}`);

  let userId = null;
  let profile = null;

  profile = await findProfileByEmail(normalizedEmail);
  if (profile?.id) {
    userId = profile.id;
    console.log(`   - Found user profile (${profile.full_name || 'Unknown Name'})`);
  }

  if (!userId) {
    console.log('   - No user profile found. Searching Auth users...');
    const authUser = await findAuthUserByEmail(normalizedEmail);
    if (!authUser) {
      console.log('   - User not found in Supabase Auth. Skipping.');
      return { email: normalizedEmail, status: 'not_found' };
    }
    userId = authUser.id;
    console.log('   - Found Auth user without profile.');
  }

  await deleteUserProfileDependencies(userId);
  await deleteUserProfile(userId);
  await deleteAuthUser(userId);

  console.log(`   ✅  Deleted user ${normalizedEmail}`);
  return { email: normalizedEmail, status: 'deleted' };
}

(async () => {
  const results = [];

  for (const email of emails) {
    try {
      const result = await deleteUserByEmail(email);
      results.push(result);
    } catch (error) {
      console.error(`   ❌  Failed to delete ${email}:`, error.message);
      results.push({ email, status: 'error', message: error.message });
    }
  }

  console.log('\nSummary:');
  for (const result of results) {
    console.log(` - ${result.email}: ${result.status}${result.message ? ` (${result.message})` : ''}`);
  }

  process.exit(0);
})();


