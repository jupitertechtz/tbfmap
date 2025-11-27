import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import AdminDashboard from './pages/admin-dashboard';
import LeagueManagement from './pages/league-management';
import TeamRegistration from './pages/team-registration';
import TeamManagementPage from './pages/team-management';
import LoginPage from './pages/login';
import MatchManagement from './pages/match-management';
import TeamProfiles from './pages/team-profiles';
import PlayerRegistration from './pages/player-registration';
import PublicLeaguePortal from './pages/public-league-portal';
import PlayerStatistics from './pages/player-statistics';
import UserManagementPage from './pages/user-management';
import ProfilePage from './pages/profile';
import EmailConfigurationPage from './pages/email-configuration';
import ForgotPasswordPage from './pages/forgot-password';
import ResetPasswordPage from './pages/reset-password';
import PlayersProfilesPage from './pages/players-profiles';
import LeagueSetup from './pages/league-setup';
import LeagueOrganizer from './pages/league-organizer';
import OfficialRegistration from './pages/official-registration';
import LeagueOfficials from './pages/league-officials';
import GamesManagement from './pages/games-management';
import MatchCenter from './pages/match-center';
import MatchesUpdatesPage from './pages/matches-updates';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<PublicLeaguePortal />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/league-management" element={<LeagueManagement />} />
        <Route path="/league-setup" element={<LeagueSetup />} />
        <Route path="/league-setup/:id" element={<LeagueSetup />} />
        <Route path="/league-organizer" element={<LeagueOrganizer />} />
        <Route path="/games-management" element={<GamesManagement />} />
        <Route path="/team-registration" element={<TeamRegistration />} />
        <Route path="/team-management" element={<TeamManagementPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/match-management" element={<MatchManagement />} />
        <Route path="/matches-updates" element={<MatchesUpdatesPage />} />
        <Route path="/team-profiles" element={<TeamProfiles />} />
        <Route path="/player-registration" element={<PlayerRegistration />} />
        <Route path="/official-registration" element={<OfficialRegistration />} />
        <Route path="/league-officials" element={<LeagueOfficials />} />
        <Route path="/public-league-portal" element={<PublicLeaguePortal />} />
        <Route path="/player-statistics" element={<PlayerStatistics />} />
        <Route path="/match-center" element={<MatchCenter />} />
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/email-configuration" element={<EmailConfigurationPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/players-profiles" element={<PlayersProfilesPage />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
