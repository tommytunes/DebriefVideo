import {
    AdvancedMarker,
    AdvancedMarkerAnchorPoint
} from '@vis.gl/react-google-maps';

const SailboatMarker = ({position, heading, mapHeading, name, color }) => (
    <AdvancedMarker position={position} anchorPoint={AdvancedMarkerAnchorPoint.CENTER}>
        <div className='relative'>
            <div className='absolute m-5'>
                <p>{name}</p>
            </div>
            <div style={{ transform: `rotate(${heading - mapHeading}deg)`, transformOrigin: 'center' }}>
            <svg width="28" height="28" viewBox='0 0 28 28' fill={color}>
                <path d="M14,3 L22,21 Q14,17 6,21 Z" strokeLinejoin="round" strokeLinecap="round" stroke={color} strokeWidth="1.5" />
            </svg>
        </div>
        </div>
        
    </AdvancedMarker>
);

export default SailboatMarker;