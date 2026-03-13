import { useState, useEffect } from 'react';
import {
    APIProvider,
    Map,
    Marker,
    AdvancedMarker,
    useMap
} from '@vis.gl/react-google-maps';
import { findTelemetryData, findTelemetryRange } from '../utils/FindTelemetryData';
import { useVideo } from '../contexts/VideoContext';


const SailboatMarker = ({position, heading, mapHeading, name }) => (
    <AdvancedMarker position={position}>
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
    const data = findTelemetryData(firstGroup.data.telemetry, absoluteTime);
    const [mapHeading, setMapHeading] = useState(0);

    const centerData = data ? {lat: data.latitude, lng: data.longitude} : {lat: 0, lgn: 0};
    const heading = data ? data.heading : 0;

    return (
        <APIProvider apiKey={import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <div style={{ height: "100%", width:"100%", position: 'relative'}}>
            <RecenterButton center={centerData} heading={heading} />
            {state.dataGroups.map( group => {
                if (group === null) return;
                const data = findTelemetryData(group.data.telemetry, absoluteTime);
                const trailPoints = findTelemetryRange(group.data.telemetry, absoluteTime, 300000);
                const path = trailPoints.map(d => ({lat: d.latitude, lng: d.longitude}));
                if(!data) return;
                return (
                <>
                    <BoatTrail key={`trail-${group.id}`} path={path} color={'red'} />
                    <SailboatMarker key={group.id} position={{lat: data.latitude, lng: data.longitude}} heading={data.heading} mapHeading={mapHeading} name={group.name}/>
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
             />
        </div>
        </APIProvider>
    );
}

export default GoogleMap;