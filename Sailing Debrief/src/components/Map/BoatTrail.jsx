import { useMap } from '@vis.gl/react-google-maps';
import { useRef, useEffect } from 'react'

const BoatTrail = ({ path, color }) => {
     const map = useMap();
     const polylineRef = useRef(null);
     useEffect(() => {
         if (!map) return;
            polylineRef.current = new google.maps.Polyline({
             path,
             strokeColor: color || '#4285F4',
             strokeOpacity: 0.8,
             strokeWeight: 3,
             map,
         });
         return () => {
            polylineRef.current?.setMap(null)
            polylineRef.current = null}; // cleanup
     }, [map, color]);

     useEffect(() => {
        if (!polylineRef.current) return;
        if (path.length < 2) {
            polylineRef.current.setPath([]);
            return;
        }
        polylineRef.current.setPath(path);
     }, [path]);
     return null;
 };

export default BoatTrail;