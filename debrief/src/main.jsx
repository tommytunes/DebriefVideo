import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { VideoProvider } from './contexts/VideoContext'
import { HashRouter } from 'react-router-dom'
import '@xzdarcy/react-timeline-editor/dist/react-timeline-editor.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <VideoProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </VideoProvider>
  </StrictMode>,
)
