import { useVideo } from '../contexts/VideoContext';

function VideoPlayback() {
    const { state } = useVideo();                                                                                           
     const { videos } = state;                                                                                               
                                                                                                                             
     console.log('VideoPlayback render, videos:', videos);  

    return (
        <>
        {videos.map((e) => (
        <div key={e.id} className="w-[640px] h-[360px] bg-black overflow-hidden">
            <video
            src={e.url}
            className="w-full h-full object-cover"
            controls/>
        </div> ))}
        </>
    );
}

export default VideoPlayback;