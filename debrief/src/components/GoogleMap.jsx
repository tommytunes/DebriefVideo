import { useState, useEffect } from 'react';
import {
    APIProvider,
    Map,
    Marker,
    AdvancedMarker,
    useMap,
    AdvancedMarkerAnchorPoint
} from '@vis.gl/react-google-maps';
import { findTelemetryData, findTelemetryRange, calculateBearing } from '../utils/FindTelemetryData';
import { useVideo } from '../contexts/VideoContext';


const SailboatMarker = ({position, heading, mapHeading, name }) => (
    <AdvancedMarker position={position} anchorPoint={AdvancedMarkerAnchorPoint.CENTER}>
        <div style={{ transform: `rotate(${heading - mapHeading}deg)`, transformOrigin: 'center' }}>
            <p>{name}</p>
            <svg width="28" height="28" viewBox='0 0 28 28' fill='white'>
                <path d="M14,3 L22,21 Q14,17 6,21 Z" strokeLinejoin="round" strokeLinecap="round" stroke="white" strokeWidth="1.5" />
            </svg>
        </div>
    </AdvancedMarker>
);

const BoatTrail = ({ path, color }) => {
     const map = useMap();
     useEffect(() => {
         if (!map || path.length < 2) return;
         const polyline = new google.maps.Polyline({
             path,
             strokeColor: color || '#4285F4',
             strokeOpacity: 0.8,
             strokeWeight: 3,
             map,
         });
         return () => polyline.setMap(null); // cleanup
     }, [map, path, color]);
     return null;
 };

const RecenterButton = ({ center, heading }) => {
    const map = useMap();
    const handleRecenter = () => {
        if (!map) return;
        map.panTo(center);
        map.setHeading(heading)
    };
    return (
        <button
            onClick={handleRecenter}
            style={{
                position: 'absolute',
                top: 10,
                left: 10,
                zIndex: 1,
                padding: '6px 12px',
                background: 'white',
                border: 'none',
                borderRadius: 4,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                cursor: 'pointer',
                fontSize: 14,
            }}
        >
            Recenter
        </button>
    );
};

const GoogleMap = ({absoluteTime}) => {
    const { state } = useVideo();
    const firstGroup = state.dataGroups[0];
    if (!firstGroup) return null;

    const [isOnline, setIsOnline] = useState(navigator.onLine);
    useEffect(() => {
        const goOnline = () => setIsOnline(true);
        const goOffline = () => setIsOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        return () => {
            window.removeEventListener('online', goOnline);
            window.removeEventListener('offline', goOffline);
        };
    }, []);


    const data = findTelemetryData(firstGroup.data.telemetry, absoluteTime);
    const [mapHeading, setMapHeading] = useState(0);

    const centerData = data ? {lat: data.latitude, lng: data.longitude} : {lat: 0, lng: 0};
    const heading = data ? data.heading : 0;
    const firstTrailPoints = findTelemetryRange(firstGroup.data.telemetry, absoluteTime, 300000);                                                                                                                                                                                                                                    
    const firstTrailHeading = firstTrailPoints.length >= 2                                                                                                                                                                                                                                                                           
    ? calculateBearing(                                                                                                                                                                                                                                                                                                          
        firstTrailPoints[firstTrailPoints.length - 2].latitude,
        firstTrailPoints[firstTrailPoints.length - 2].longitude,
        firstTrailPoints[firstTrailPoints.length - 1].latitude,
        firstTrailPoints[firstTrailPoints.length - 1].longitude
    )
    : heading;
    
    if (!isOnline) {
     return (
         <div style={{ height: '100%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', color: 'white' }}>
             <div style={{ textAlign: 'center' }}>
                 <p style={{ fontSize: 18, fontWeight: 'bold' }}>No Internet Connection</p>
                 <p style={{ fontSize: 14, color: '#aaa', marginTop: 8 }}>
                     An internet connection is required to display the map.
                 </p>
             </div>
         </div>
     );
    }


    return (
        <APIProvider apiKey={import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <div style={{ height: "100%", width:"100%", position: 'relative'}}>
            <RecenterButton center={centerData} heading={firstTrailHeading} />
            {state.dataGroups.map( group => {
                if (group === null) return;
                const data = findTelemetryData(group.data.telemetry, absoluteTime);
                const trailPoints = findTelemetryRange(group.data.telemetry, absoluteTime, 300000);
                const path = trailPoints.map(d => ({lat: d.latitude, lng: d.longitude}));
                if(!data) return;
                const trailHeading = trailPoints.length >= 2
                    ? calculateBearing(
                        trailPoints[trailPoints.length - 2].latitude,
                        trailPoints[trailPoints.length - 2].longitude,
                        trailPoints[trailPoints.length - 1].latitude,
                        trailPoints[trailPoints.length - 1].longitude
                      )
                    : data.heading;
                return (
                <>
                    <BoatTrail key={`trail-${group.id}`} path={path} color={'red'} />
                    <SailboatMarker key={group.id} position={{lat: data.latitude, lng: data.longitude}} heading={trailHeading} mapHeading={mapHeading} name={group.name}/>
                </>);
            })}
            <Map
            defaultZoom={15}
            defaultCenter={centerData}
            onCameraChanged={(e) => setMapHeading(e.detail.heading || 0)}
            defaultHeading={heading}
            mapId={import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_ID}
            mapTypeControlOptions={false}
            mapTypeControl={false}
            disableDefaultUI={true}
            />
        </div>
        </APIProvider>
    );
}

export default GoogleMap;