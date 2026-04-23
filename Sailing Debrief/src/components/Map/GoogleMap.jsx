import { useState, useEffect, useRef } from 'react';
import {
    APIProvider,
    Map,
    Marker,
    AdvancedMarker,
    useMap,
    AdvancedMarkerAnchorPoint
} from '@vis.gl/react-google-maps';
import { findTelemetryData, findTelemetryRange, calculateBearing } from '../../utils/FindTelemetryData';
import { useVideo } from '../../contexts/VideoContext';
import { EllipsisVertical } from 'lucide-react';
import { PALETTE } from '../../constants/Palette';
import SailboatMarker from './SailboatMarker';
import BoatTrail from './BoatTrail';
import WindHeadingInput from './WindHeadingInput';
import RecenterButton from './RecenterButton';
import MapSettings from './MapSetting';
import MarkMarker from './MarkMarker';


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
            <div className='absolute gap-2 flex flex-col'>
                <WindHeadingInput />
                <RecenterButton center={centerData} />
            </div>
            {state.dataGroups.map( (group, i) => {
                if (group === null) return;
                const data = findTelemetryData(group.data.telemetry, absoluteTime);
                const trailPoints = findTelemetryRange(group.data.telemetry, absoluteTime, state.map.tailLength);
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
                    <BoatTrail key={`trail-${group.id}`} path={path} color={PALETTE[i % PALETTE.length]} />
                    {group.type === 'mark' ?
                    <MarkMarker position={{lat: data.latitude, lng: data.longitude}}/> :
                    <SailboatMarker key={group.id} position={{lat: data.latitude, lng: data.longitude}} heading={trailHeading} mapHeading={mapHeading} name={group.name} color={PALETTE[i % PALETTE.length]}/>
            }
                </>);
            })}
            <Map
            defaultZoom={15}
            defaultCenter={centerData}
            onCameraChanged={(e) => setMapHeading(e.detail.heading || 0)}
            defaultHeading={state.map.windDirection}
            mapId={import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_ID}
            disableDefaultUI={true}
            zoomControl={false}
            />
            <MapSettings />
        </div>
        </APIProvider>
    );
}

export default GoogleMap;