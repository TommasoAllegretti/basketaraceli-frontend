import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { Players } from './pages/Players'
import { Player } from './pages/Player'
import { Teams } from './pages/Teams'
import { Team } from './pages/Team'
import { CreateTeam } from './pages/CreateTeam'
import { Clubs } from './pages/Clubs'
// import Dashboard from './pages/Dashboard'
import { Login } from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { ThemeProvider } from './components/theme-provider'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <AuthProvider>
        <BrowserRouter basename="/admin">
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

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
                    <Route path="/teams" element={<Teams />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/create-team" element={<CreateTeam />} />
                    <Route path="/clubs" element={<Clubs />} />
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
