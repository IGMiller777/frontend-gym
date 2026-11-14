import { lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router'
import { Layout } from './components/Layout'

// Pages load on demand so the first screen does not pull every track's content.
const Home = lazy(() => import('./pages/Home'))
const TrackPage = lazy(() => import('./pages/TrackPage'))
const LessonPage = lazy(() => import('./pages/LessonPage'))
const ExamPage = lazy(() => import('./pages/ExamPage'))
const CodingListPage = lazy(() => import('./pages/CodingListPage'))
const CodingTaskPage = lazy(() => import('./pages/CodingTaskPage'))
const PredictListPage = lazy(() => import('./pages/PredictListPage'))
const PredictTaskPage = lazy(() => import('./pages/PredictTaskPage'))
const InterviewPage = lazy(() => import('./pages/InterviewPage'))
const IncidentListPage = lazy(() => import('./pages/IncidentListPage'))
const IncidentPage = lazy(() => import('./pages/IncidentPage'))
const NotFound = lazy(() => import('./pages/NotFound'))

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="track/:id" element={<TrackPage />} />
          <Route path="track/:id/exam" element={<ExamPage />} />
          <Route path="learn/:id" element={<LessonPage />} />
          <Route path="practice/coding" element={<CodingListPage />} />
          <Route path="code/:id" element={<CodingTaskPage />} />
          <Route path="practice/predict" element={<PredictListPage />} />
          <Route path="predict/:id" element={<PredictTaskPage />} />
          <Route path="interview" element={<InterviewPage />} />
          <Route path="practice/incidents" element={<IncidentListPage />} />
          <Route path="incident/:id" element={<IncidentPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
