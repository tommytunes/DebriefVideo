import MediaDropZone from "./components/MediaDropZone";
import VideoPlayback from "./components/VideoPlayback";
import PlaybackControl  from "./components/PlaybackControl";
import VideoSource from "./components/VideoSource";
import NavBar from "./components/NavBar";
import TimelineEditor from "./components/Timeline";
import VideoGroupSelection from "./components/VideoGroupSelection";
import {Routes, Route} from "react-router-dom";


function App() {
  //      <Route path="/" element={<><VideoGroupSelection></VideoGroupSelection><VideoPlayback /><PlaybackControl /><TimelineEditor /></>} />

  return (
    <div className="flex flex-col h-screen">
    <NavBar />
    <Routes>
      <Route path="/" element={
      <>
      <div className="flex-1">
        <VideoGroupSelection />
        <VideoPlayback />
        
      </div>
        <PlaybackControl />
        <TimelineEditor />
        </>
      } />

      <Route path="/files" element={<><VideoSource /></>} />
    </Routes>
    </div>
  )
}

export default App
