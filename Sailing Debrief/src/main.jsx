import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { VideoProvider } from './contexts/VideoContext'
import { HashRouter } from 'react-router-dom'
import '@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css';
import { AuthProvider } from './auth/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
    <VideoProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </VideoProvider>
    </AuthProvider>
  </StrictMode>,
)
