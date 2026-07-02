import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Onboarding } from './pages/Onboarding'
import { Recommend } from './pages/Recommend'
import { Search } from './pages/Search'
import { ResourceDetail } from './pages/ResourceDetail'
import { Similar } from './pages/Similar'
import { Analyze } from './pages/Analyze'
import { ScrollToTop } from './components/ScrollToTop'

export default function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/search" element={<Search />} />
        <Route path="/resource/:id" element={<ResourceDetail />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/similar/:id" element={<Similar />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  )
}
