import MediaDropZone from "./components/MediaDropZone";
import VideoPlayback from "./components/VideoPlayback";
import PlaybackControl  from "./components/PlaybackControl";
import VideoSource from "./components/VideoSource";
import NavBar from "./components/NavBar";
import TimelineEditor from "./components/Timeline";
import ListMedia from "./components/ListMedia"
import AudioSource from "./components/AudioSource";
import AudioPlayback from "./components/AudioPlayback";
import {Routes, Route} from "react-router-dom";


function App() {

  return (
    <div className="flex flex-col h-screen">
    <NavBar />
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
      <div className="flex flex-row">
        <VideoSource />
        <AudioSource />
      </div>} />
    </Routes>
    </div>
  )
}

export default App
