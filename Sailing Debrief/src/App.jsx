import VideoPlayback from "./components/Playback/VideoPlayback";
import VideoSource from "./components/MediaSources/VideoSource";
import NavBar from "./components/NavBar/NavBar";
import TimelineEditor from "./components/Timeline/Timeline";
import AudioSource from "./components/MediaSources/AudioSource";
import AudioPlayback from "./components/Playback/AudioPlayback";
import {Routes, Route, useLocation} from "react-router-dom";
import DataSource from "./components/MediaSources/DataSource";
import ProjectSaveLoad from "./components/Files/ProjectSaveLoad";
import TimelineSidebar from "./components/Timeline/TimelineSidebar";
import { useAuth } from "./auth/AuthProvider";
import { LoginScreen } from "./auth/LoginScreen";

function App() {

  const { user, loading } = useAuth();

  //if (loading) return <div>Loading...</div>
  //if (!user) return <LoginScreen />

  return (
    <div className="flex flex-col h-screen overflow-hidden">
    <NavBar />
    <ProjectSaveLoad />
    <Routes>
      <Route path="/" element={
      <>
      <div className="flex-1 min-h-0">
        
        <VideoPlayback />
        <AudioPlayback />
      </div>
       <div className="flex flex-row items-start bg-gray-400">
        <TimelineSidebar />                                                                                                                                                                                                                                                     
        <TimelineEditor />                                                                                                                                    
      </div> 
        </>
      } />

      <Route path="/files" element={
      <div className="flex flex-row flex-1 min-h-0 overflow-hidden">
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto"><VideoSource /></div>
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto"><AudioSource /></div>
        <div className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto"><DataSource /></div>
      </div>
    } />
    </Routes>
    </div>
  )
}

export default App
