import MediaDropZone from "./components/MediaDropZone";
import VideoPlayback from "./components/VideoPlayback";
import PlaybackControl  from "./components/PlaybackControl";
import VideoSource from "./components/VideoSource";
import NavBar from "./components/NavBar";
import TimelineEditor from "./components/Timeline";
import ListMedia from "./components/ListMedia"
import AudioSource from "./components/AudioSource";
import AudioPlayback from "./components/AudioPlayback";
import {Routes, Route, useLocation} from "react-router-dom";
import { useEffect } from "react";
import DataSource from "./components/DataSource";
import ProjectSaveLoad from "./components/ProjectSaveLoad";


function App() {

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
       <div className="flex flex-row">
        <div className="flex flex-col bg-gray-400">
          <PlaybackControl />
          <ListMedia />   
        </div>                                                                                                                                                                                                                                                      
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
