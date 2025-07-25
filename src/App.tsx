import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Home } from './pages/Home'
// import Dashboard from './pages/Dashboard'
import { Login } from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import { ThemeProvider } from './components/theme-provider'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
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
                  <Route path="/" element={<Home />} />
                  {/* <Route path="/dashboard" element={<Dashboard />} /> */}
                </Routes>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
