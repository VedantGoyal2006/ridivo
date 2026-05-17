import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<><Navbar /><LandingPage /></>} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/signup" element={<AuthPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App