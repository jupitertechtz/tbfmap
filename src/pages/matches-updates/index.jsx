import React, { useState } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const MatchesUpdatesPage = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const breadcrumbItems = [
    { label: 'Admin Dashboard', path: '/admin-dashboard' },
    { label: 'Match Operations', path: '/match-management' },
    { label: 'Matches Updates' },
  ];

  const initialMatches = [
    { id: 1, home: 'Dar City Warriors', away: 'Mwanza Lakers', score: '78 - 74', status: 'Final', date: '2025-02-12' },
    { id: 2, home: 'Arusha Eagles', away: 'Mbeya Thunder', score: '64 - 64', status: 'Awaiting Update', date: '2025-02-10' },
    { id: 3, home: 'Dodoma Capitals', away: 'Zanzibar Royals', score: '82 - 79', status: 'Final', date: '2025-02-08' },
  ];
  const [matches, setMatches] = useState(initialMatches);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [editForm, setEditForm] = useState({
    homeScore: '',
    awayScore: '',
    status: 'Final',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  const openEditModal = (match) => {
    if (!match) return;
    const [homeScore, awayScore] = match.score.split('-').map((val) => val.trim());
    setSelectedMatch(match);
    setEditForm({
      homeScore: homeScore || '',
      awayScore: awayScore || '',
      status: match.status || 'Final',
      notes: match.notes || '',
    });
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setSelectedMatch(null);
    setEditForm({
      homeScore: '',
      awayScore: '',
      status: 'Final',
      notes: '',
    });
  };

  const handleEditFormChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveMatch = async (event) => {
    event?.preventDefault();
    if (!selectedMatch) return;

    setIsSaving(true);
    setBanner(null);
    try {
      const updatedMatch = {
        ...selectedMatch,
        score: `${editForm.homeScore || 0} - ${editForm.awayScore || 0}`,
        status: editForm.status,
        notes: editForm.notes,
      };

      setMatches((prev) =>
        prev.map((match) => (match.id === updatedMatch.id ? updatedMatch : match))
      );
      setBanner({ type: 'success', message: 'Match updated successfully.' });
      closeEditModal();
    } catch (error) {
      setBanner({ type: 'error', message: error?.message || 'Failed to save match.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <main
        className={`pt-16 transition-all duration-300 ${
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        }`}
      >
        <div className="p-6 space-y-6">
          <div className="flex flex-col space-y-4">
            <Breadcrumb items={breadcrumbItems} />
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="ClipboardList" size={24} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Matches Updates</h1>
                  <p className="text-muted-foreground">
                    Record final scores, statistics, and post-game notes for recently completed fixtures.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" iconName="RefreshCcw">
                  Sync Latest Fixtures
                </Button>
                <Button variant="default" iconName="Plus">
                  Record Manual Update
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-border rounded-lg card-shadow">
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Recent Matches</h2>
                  <p className="text-sm text-muted-foreground">
                    Double-check scores, statuses, and key notes before publishing.
                  </p>
                </div>
                <Icon name="ListChecks" size={20} className="text-muted-foreground" />
              </div>
              <div className="divide-y divide-border">
                {matches.map((match) => (
                  <div key={match.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">
                        {match.home} vs {match.away}
                      </p>
                      <p className="text-sm text-muted-foreground">{match.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-foreground">{match.score}</p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          match.status === 'Final'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {match.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        iconName="Edit"
                        onClick={() => openEditModal(match)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg card-shadow p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon name="PenSquare" size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-foreground">Update Toolkit</h2>
                  <p className="text-sm text-muted-foreground">
                    Fast actions and reminders for post-game workflow.
                  </p>
                </div>
              </div>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={16} className="text-success mt-0.5" />
                  Verify official final score and overtime notes.
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="TrendingUp" size={16} className="text-primary mt-0.5" />
                  Record team and player statistics from official sources.
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="UploadCloud" size={16} className="text-warning mt-0.5" />
                  Upload scanned score sheets or commissioner reports.
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="Bell" size={16} className="text-secondary mt-0.5" />
                  Notify media and league administrators once updates are complete.
                </li>
              </ul>
              <div className="flex gap-2">
                <Button className="w-full" variant="default" iconName="ClipboardSignature">
                  Open Update Form
                </Button>
                <Button className="w-full" variant="outline" iconName="Upload">
                  Attach Documents
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      {editModalOpen && selectedMatch && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-lg w-full card-shadow">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Edit Match</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedMatch.home} vs {selectedMatch.away} — {selectedMatch.date}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={closeEditModal}>
                <Icon name="X" size={18} />
              </Button>
            </div>
            <form onSubmit={handleSaveMatch} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Home Score</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.homeScore}
                    onChange={(e) => handleEditFormChange('homeScore', e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Away Score</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.awayScore}
                    onChange={(e) => handleEditFormChange('awayScore', e.target.value)}
                    className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Match Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => handleEditFormChange('status', e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                >
                  <option value="Final">Final</option>
                  <option value="Awaiting Update">Awaiting Update</option>
                  <option value="Overtime Review">Overtime Review</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Notes / Highlights</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => handleEditFormChange('notes', e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground"
                  placeholder="Add key statistics, MVP mention, injuries, overtime details..."
                />
              </div>

              {banner && (
                <div
                  className={`px-3 py-2 rounded text-sm ${
                    banner.type === 'success'
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  {banner.message}
                </div>
              )}

              <div className="flex items-center justify-end gap-2">
                <Button type="button" variant="ghost" onClick={closeEditModal} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" iconName="Save" loading={isSaving} disabled={isSaving}>
                  Save Updates
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchesUpdatesPage;

