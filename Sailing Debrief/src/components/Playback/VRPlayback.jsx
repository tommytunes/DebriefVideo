import { useEffect, useRef } from 'react';
 import videojs from 'video.js';
 import 'video.js/dist/video-js.css';
 import 'videojs-vr/dist/videojs-vr.css';
 import 'videojs-vr';

 const VRPlayback = ({ videoRef, src, offsetInVideo, isPlaying, muted }) => {
     const containerRef = useRef(null);
     const playerRef = useRef(null);

     // Init VideoJS + VR on mount, wire internal <video> to videoRef for master clock
     useEffect(() => {
         const player = videojs(containerRef.current, {
             controls: false,
             autoplay: false,
             preload: 'auto',
             sources: [{ src, type: 'video/mp4' }],
             fill: true,
             muted,
         });
         player.vr({ projection: 'equirectangular' });
         playerRef.current = player;

         // Expose internal <video> element to the master clock ref
         player.ready(() => {
             videoRef.current = player.tech(true).el();
         });

         return () => {
             videoRef.current = null;
             player.dispose();
             playerRef.current = null;
         };
     }, [src]);

     // Drive play/pause — master clock handles currentTime correction via the wired ref
     useEffect(() => {
         const player = playerRef.current;
         if (!player || player.isDisposed()) return;
         if (isPlaying) {
             player.currentTime(offsetInVideo);
             player.play().catch(() => {});
         } else {
             player.pause();
         }
     }, [isPlaying]);

     // Paused scrubbing
     useEffect(() => {
         const player = playerRef.current;
         if (!player || player.isDisposed() || isPlaying) return;
         player.currentTime(offsetInVideo);
     }, [offsetInVideo]);

     useEffect(() => {
         const player = playerRef.current;
         if (!player || player.isDisposed()) return;
         player.muted(muted);
     }, [muted]);

     return (
         <div data-vjs-player className="w-full h-full bg-black">
             <video ref={containerRef} className="video-js w-full h-full" />
         </div>
     );
 };

 export default VRPlayback;