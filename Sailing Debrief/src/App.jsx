import VideoPlayback from "./components/Playback/SourcePlayback";
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
import OpenDashboard from "./components/Dashboard/OpenDashboard";
import Dashboard from "./components/Dashboard/Dashboard";
import { useVideo } from './contexts/VideoContext';
import UpdateBanner from "./components/NavBar/updateBanner";
import TrialExpired from "./auth/TrialExpired";

function App() {

  const { user, loading } = useAuth();
  const { state } = useVideo();

  return (
    <>
    <div className="flex flex-col h-screen overflow-hidden">
    <NavBar />
    <UpdateBanner />
    <ProjectSaveLoad />
    <OpenDashboard />
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

    {loading && (
    <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex items-center justify-center">
      <div className="text-white text-lg">Loading...</div>
    </div>
    )}
    {!loading && !user && (
      <div className="fixed inset-0 z-50 backdrop-blur-sm bg-black/50 flex items-center justify-center">
        <LoginScreen />
      </div>
    )}

    {state.showDashboard && <Dashboard />}
    {state.trialExpired && <TrialExpired />}
    </>
  )
}

export default App
