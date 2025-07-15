import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from '@/components/theme-provider'

import { Home } from './pages/Home'
import { Login } from './pages/Login'

export function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}
