import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Players } from './pages/Players'
import { Player } from './pages/Player'
import { Teams } from './pages/Teams'
import { Team } from './pages/Team'
import { TeamCreate } from './pages/TeamCreate'
import { TeamEdit } from './pages/TeamEdit'
import { Clubs } from './pages/Clubs'
import { Club } from './pages/Club'
import { ClubCreate } from './pages/ClubCreate'
import { ClubEdit } from './pages/ClubEdit'
import { Leagues } from './pages/Leagues'
import { LeagueCreate } from './pages/LeagueCreate'
// import Dashboard from './pages/Dashboard'
import { Login } from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { ThemeProvider } from './components/theme-provider'
import { AuthProvider } from './contexts/AuthContext'
import { LeagueEdit } from './pages/LeagueEdit'
import { League } from './pages/League'
import { PlayerCreate } from './pages/PlayerCreate'
import { PlayerEdit } from './pages/PlayerEdit'
import { ForgotPassword } from './pages/ForgotPassword'
import { ResetPassword } from './pages/ResetPassword'
import { Games } from './pages/Games'
import { Game } from './pages/Game'
import { GameCreate } from './pages/GameCreate'
import { GameEdit } from './pages/GameEdit'
import { GameStats } from './pages/GameStats'
import { GameStat } from './pages/GameStat'
import { GameStatCreate } from './pages/GameStatCreate'
import { GameStatEdit } from './pages/GameStatEdit'
import { LiveGame } from './pages/LiveGame'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter basename="/admin">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Home />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/players" element={<Players />} />
                    <Route path="/player" element={<Player />} />
                    <Route path="/create-player" element={<PlayerCreate />} />
                    <Route path="/edit-player" element={<PlayerEdit />} />
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/create-team" element={<TeamCreate />} />
                    <Route path="/edit-team" element={<TeamEdit />} />
                    <Route path="/clubs" element={<Clubs />} />
                    <Route path="/club" element={<Club />} />
                    <Route path="/create-club" element={<ClubCreate />} />
                    <Route path="/edit-club" element={<ClubEdit />} />
                    <Route path="/leagues" element={<Leagues />} />
                    <Route path="/league" element={<League />} />
                    <Route path="/create-league" element={<LeagueCreate />} />
                    <Route path="/edit-league" element={<LeagueEdit />} />
                    <Route path="/games" element={<Games />} />
                    <Route path="/game" element={<Game />} />
                    <Route path="/create-game" element={<GameCreate />} />
                    <Route path="/edit-game" element={<GameEdit />} />
                    <Route path="/game-stats" element={<GameStats />} />
                    <Route path="/game-stat" element={<GameStat />} />
                    <Route path="/create-game-stat" element={<GameStatCreate />} />
                    <Route path="/edit-game-stat" element={<GameStatEdit />} />
                    <Route path="/live-game" element={<LiveGame />} />
                  </Routes>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
