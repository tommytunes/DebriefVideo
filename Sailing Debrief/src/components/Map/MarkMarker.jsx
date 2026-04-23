import { AdvancedMarker } from '@vis.gl/react-google-maps';

const MarkMarker = ({ position }) => (
    <AdvancedMarker position={position}>
        <svg width="20" height="20" viewBox="0 0 20 20">
            <circle cx="10" cy="10" r="9" fill="red" stroke="white" strokeWidth="2" />
        </svg>
    </AdvancedMarker>
);

export default MarkMarker;
