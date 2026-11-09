import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'

// Pages load on demand so the first screen does not pull every track's content.
const Home = lazy(() => import('./pages/Home'))
const TrackPage = lazy(() => import('./pages/TrackPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="track/:id" element={<TrackPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
