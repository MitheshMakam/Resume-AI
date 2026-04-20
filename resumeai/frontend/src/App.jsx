import { Routes, Route, NavLink, useLocation } from 'react-router-dom'
import { FileText, Briefcase, Users, Zap } from 'lucide-react'
import AnalyzerPage from './pages/AnalyzerPage'
import JobsPage from './pages/JobsPage'
import RecruiterPage from './pages/RecruiterPage'
import LandingPage from './pages/LandingPage'

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-white">
          <div className="w-7 h-7 bg-brand-500 rounded-lg flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          ResumeAI
        </NavLink>
        <div className="flex items-center gap-1">
          <NavLink to="/analyzer" className={({isActive}) =>
            `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`
          }>
            <FileText size={14} /> Analyzer
          </NavLink>
          <NavLink to="/jobs" className={({isActive}) =>
            `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`
          }>
            <Briefcase size={14} /> Jobs
          </NavLink>
          <NavLink to="/recruiter" className={({isActive}) =>
            `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`
          }>
            <Users size={14} /> Recruiter
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-14">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/analyzer" element={<AnalyzerPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/recruiter" element={<RecruiterPage />} />
        </Routes>
      </div>
    </div>
  )
}
