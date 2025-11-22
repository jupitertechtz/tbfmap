import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Icon from '../../components/AppIcon';
import { userService } from '../../services/userService';
import { useAuth } from '../../contexts/AuthContext';

const roleOptions = [
  { label: 'Administrator', value: 'admin', description: 'Full system access' },
  { label: 'Staff', value: 'staff', description: 'Operations and support' },
  { label: 'Team Manager', value: 'team_manager', description: 'Manage team records' },
  { label: 'Official', value: 'official', description: 'Manage fixtures and officiating' },
  { label: 'Player', value: 'player', description: 'Player self-service access' },
];

const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  confirmPassword: '',
};

const initialFilters = {
  searchTerm: '',
  role: 'all',
};

const UserManagementPage = () => {
  const navigate = useNavigate();
  const { userProfile, loading: authLoading } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);
  const [formState, setFormState] = useState(initialFormState);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [banner, setBanner] = useState(null);
  const [filtersDraft, setFiltersDraft] = useState(initialFilters);
  const [activeFilters, setActiveFilters] = useState(initialFilters);
  const [updatingUserIds, setUpdatingUserIds] = useState(new Set());
  const [refreshToken, setRefreshToken] = useState(0);

  // Check if user is admin
  const isAdmin = userProfile?.role === 'admin';

  // Redirect non-admin users
  useEffect(() => {
    if (authLoading) return;
    
    if (!isAdmin) {
      navigate('/admin-dashboard', { replace: true });
    }
  }, [authLoading, isAdmin, navigate]);

  const breadcrumbItems = useMemo(
    () => [
      { label: 'Admin Dashboard', path: '/admin-dashboard' },
      { label: 'User Management', path: '/user-management' },
    ],
    []
  );

  useEffect(() => {
    let isMounted = true;
    const loadUsers = async () => {
      setIsLoadingUsers(true);
      setUsersError(null);

      try {
        const data = await userService.listUsers({
          searchTerm: activeFilters?.searchTerm,
          role: activeFilters?.role,
        });

        if (isMounted) {
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        if (isMounted) {
          const message = error?.message || 'Failed to load users. Please try again.';
          setUsersError(message);
          setBanner({ type: 'error', message });
        }
      } finally {
        if (isMounted) {
          setIsLoadingUsers(false);
        }
      }
    };

    loadUsers();

    return () => {
      isMounted = false;
    };
  }, [activeFilters, refreshToken]);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed((prev) => !prev);
  };

  const handleFormChange = (field, value) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [field]: undefined,
    }));
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formState?.fullName?.trim()) {
      errors.fullName = 'Full name is required.';
    }

    if (!formState?.email?.trim()) {
      errors.email = 'Email is required.';
    } else if (!emailRegex.test(formState?.email?.trim())) {
      errors.email = 'Enter a valid email address.';
    }

    if (!formState?.role) {
      errors.role = 'Select a role for the new user.';
    }

    if (!formState?.password) {
      errors.password = 'Password is required.';
    } else if (formState?.password?.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    }

    if (!formState?.confirmPassword) {
      errors.confirmPassword = 'Confirm the password.';
    } else if (formState?.confirmPassword !== formState?.password) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFormErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const resetForm = () => {
    setFormState(initialFormState);
    setFormErrors({});
  };

  const handleCreateUser = async (event) => {
    event?.preventDefault();
    setBanner(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const newUser = await userService.createUser({
        email: formState?.email?.trim(),
        password: formState?.password,
        fullName: formState?.fullName?.trim(),
        role: formState?.role,
        phone: formState?.phone?.trim() || null,
      });

      if (newUser) {
        setUsers((prev) => [newUser, ...prev]);
      } else {
        setRefreshToken((prev) => prev + 1);
      }

      setBanner({
        type: 'success',
        message: 'User account created successfully and confirmation email sent.',
      });
      resetForm();
    } catch (error) {
      const message =
        error?.message ||
        'Unable to create the user right now. Please verify your credentials and try again.';
      setBanner({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleUserStatus = async (user) => {
    if (!user?.id) return;

    setBanner(null);
    setUpdatingUserIds((prev) => {
      const next = new Set(prev);
      next.add(user?.id);
      return next;
    });

    try {
      const updated = await userService.toggleUserActive(user?.id, !user?.isActive);

      setUsers((prev) =>
        prev?.map((existing) => (existing?.id === user?.id ? updated : existing))
      );

      setBanner({
        type: 'success',
        message: `User ${updated?.isActive ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (error) {
      const message =
        error?.message || 'Failed to update the user status. Please try again later.';
      setBanner({ type: 'error', message });
    } finally {
      setUpdatingUserIds((prev) => {
        const next = new Set(prev);
        next.delete(user?.id);
        return next;
      });
    }
  };

  const handleFilterSubmit = (event) => {
    event?.preventDefault();
    setActiveFilters({
      searchTerm: filtersDraft?.searchTerm?.trim(),
      role: filtersDraft?.role || 'all',
    });
  };

  const handleClearFilters = () => {
    setFiltersDraft(initialFilters);
    setActiveFilters(initialFilters);
  };

  const isUserUpdating = (userId) => updatingUserIds?.has(userId);

  const filteredBannerClassName = useMemo(() => {
    if (!banner) return '';
    if (banner?.type === 'success') return 'bg-success/10 border-success/20 text-success';
    if (banner?.type === 'error') return 'bg-destructive/10 border-destructive/20 text-destructive';
    return 'bg-muted border-border text-foreground';
  }, [banner]);

  const formatDate = (value) => {
    if (!value) return '-';
    try {
      const date = new Date(value);
      if (Number.isNaN(date?.getTime())) return '-';
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })?.format(date);
    } catch {
      return '-';
    }
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show access denied for non-admin users
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="ShieldAlert" size={48} className="text-warning mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground">You don't have permission to access this page.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => navigate('/admin-dashboard')}
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex">
        <Sidebar isCollapsed={isSidebarCollapsed} onToggle={handleSidebarToggle} />
        <main className="flex-1 ml-64 mt-16 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">User Management</h1>
                <p className="text-muted-foreground mt-1">
                  Invite administrators, team managers, and staff directly from the system.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon name="Shield" size={16} />
                <span>Service key required for admin invitations</span>
              </div>
            </div>

            {banner && (
              <div className={`px-4 py-3 rounded-lg border ${filteredBannerClassName}`}>
                <div className="flex items-start gap-3">
                  <Icon
                    name={
                      banner?.type === 'success'
                        ? 'CheckCircle2'
                        : banner?.type === 'error'
                        ? 'AlertTriangle'
                        : 'Info'
                    }
                    size={18}
                  />
                  <div className="space-y-1">
                    <p className="font-medium">{banner?.message}</p>
                    {banner?.type === 'error' && banner?.message?.includes('Admin client') && (
                      <p className="text-sm text-muted-foreground">
                        Ensure the API server is running and `SUPABASE_SERVICE_ROLE_KEY` is configured in `api/.env`.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-lg p-6 space-y-6 card-shadow">
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">Invite New User</h2>
                    <p className="text-sm text-muted-foreground">
                      Create user accounts directly without requiring self-registration.
                    </p>
                  </div>
                  <form className="space-y-4" onSubmit={handleCreateUser}>
                    <Input
                      label="Full Name"
                      required
                      placeholder="Jane Doe"
                      value={formState?.fullName}
                      onChange={(event) => handleFormChange('fullName', event?.target?.value)}
                      error={formErrors?.fullName}
                    />
                    <Input
                      label="Email Address"
                      type="email"
                      required
                      placeholder="jane.doe@example.com"
                      value={formState?.email}
                      onChange={(event) => handleFormChange('email', event?.target?.value)}
                      error={formErrors?.email}
                    />
                    <Input
                      label="Phone Number"
                      type="tel"
                      placeholder="+255 700 000 000"
                      value={formState?.phone}
                      onChange={(event) => handleFormChange('phone', event?.target?.value)}
                      error={formErrors?.phone}
                    />
                    <Select
                      label="Role"
                      required
                      placeholder="Select user role"
                      options={roleOptions}
                      value={formState?.role}
                      onChange={(value) => handleFormChange('role', value)}
                      error={formErrors?.role}
                      searchable
                    />
                    <Input
                      label="Password"
                      type="password"
                      required
                      placeholder="Enter a secure password"
                      value={formState?.password}
                      onChange={(event) => handleFormChange('password', event?.target?.value)}
                      error={formErrors?.password}
                    />
                    <Input
                      label="Confirm Password"
                      type="password"
                      required
                      placeholder="Retype the password"
                      value={formState?.confirmPassword}
                      onChange={(event) =>
                        handleFormChange('confirmPassword', event?.target?.value)
                      }
                      error={formErrors?.confirmPassword}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      iconName="UserPlus"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                    >
                      Invite User
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={resetForm}
                      disabled={isSubmitting}
                    >
                      Reset Form
                    </Button>
                  </form>

                  <div className="rounded-lg bg-muted/40 px-4 py-3 text-sm text-muted-foreground space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Info" size={16} className="mt-0.5" />
                      <div>
                        <p className="font-medium text-foreground">User Creation</p>
                        <p>
                          User creation is handled securely via the backend API. Ensure the API server is running and configured with `SUPABASE_SERVICE_ROLE_KEY` in `api/.env`.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                <div className="bg-card border border-border rounded-lg p-6 card-shadow">
                  <form
                    className="flex flex-col md:flex-row md:items-end gap-4"
                    onSubmit={handleFilterSubmit}
                  >
                    <div className="flex-1">
                      <Input
                        label="Search Users"
                        placeholder="Search by name, email, or phone"
                        value={filtersDraft?.searchTerm}
                        onChange={(event) =>
                          setFiltersDraft((prev) => ({
                            ...prev,
                            searchTerm: event?.target?.value,
                          }))
                        }
                      />
                    </div>
                    <div className="w-full md:w-56">
                      <Select
                        label="Role"
                        value={filtersDraft?.role}
                        onChange={(value) =>
                          setFiltersDraft((prev) => ({
                            ...prev,
                            role: value || 'all',
                          }))
                        }
                        options={[
                          { label: 'All roles', value: 'all' },
                          ...roleOptions,
                        ]}
                        clearable
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" iconName="Search">
                        Apply
                      </Button>
                      <Button type="button" variant="outline" onClick={handleClearFilters}>
                        Reset
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="bg-card border border-border rounded-lg card-shadow">
                  <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">Directory</h2>
                      <p className="text-sm text-muted-foreground">
                        {isLoadingUsers
                          ? 'Loading users...'
                          : `${users?.length ?? 0} user${users?.length === 1 ? '' : 's'} found`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Icon name="UserCheck" size={16} />
                      <span>Active invitations sync automatically</span>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead>
                        <tr className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                          <th className="px-6 py-3">User</th>
                          <th className="px-6 py-3">Role</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Created</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {isLoadingUsers ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">
                              <div className="flex items-center justify-center gap-2">
                                <svg
                                  className="animate-spin h-5 w-5 text-muted-foreground"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                    fill="none"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  />
                                </svg>
                                <span>Fetching the latest user directory…</span>
                              </div>
                            </td>
                          </tr>
                        ) : users?.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground">
                              <div className="flex flex-col items-center gap-3">
                                <Icon name="Users" size={24} />
                                <p className="font-medium text-foreground">
                                  No users found for the selected filters
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Try adjusting your filters or invite a new user.
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          users?.map((user) => (
                            <tr key={user?.id} className="hover:bg-muted/40 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex flex-col">
                                  <span className="font-medium text-foreground">
                                    {user?.fullName || 'Unnamed User'}
                                  </span>
                                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                                    <Icon name="Mail" size={14} />
                                    {user?.email || 'No email'}
                                  </span>
                                  {user?.phone && (
                                    <span className="text-sm text-muted-foreground flex items-center gap-2">
                                      <Icon name="Phone" size={14} />
                                      {user?.phone}
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium capitalize">
                                  <Icon name="IdCard" size={14} />
                                  {user?.role?.replace(/_/g, ' ')}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span
                                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                                    user?.isActive
                                      ? 'bg-success/10 text-success'
                                      : 'bg-destructive/10 text-destructive'
                                  }`}
                                >
                                  <span className="w-2 h-2 rounded-full bg-current" />
                                  {user?.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-muted-foreground">
                                {formatDate(user?.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <Button
                                    variant={user?.isActive ? 'outline' : 'success'}
                                    size="sm"
                                    iconName={user?.isActive ? 'UserX' : 'UserCheck'}
                                    onClick={() => handleToggleUserStatus(user)}
                                    loading={isUserUpdating(user?.id)}
                                    disabled={isUserUpdating(user?.id)}
                                  >
                                    {user?.isActive ? 'Deactivate' : 'Activate'}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {usersError && !isLoadingUsers && (
                    <div className="border-t border-border px-6 py-4 bg-destructive/10 text-destructive text-sm">
                      {usersError}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserManagementPage;


