import {useMap} from '@vis.gl/react-google-maps';

const RecenterButton = ({ center }) => {
    const map = useMap();
    const handleRecenter = () => {
        if (!map) return;
        map.panTo(center);
    };
    return (
        <button
            onClick={handleRecenter}
            style={{
                position: 'absolute',
                top: 75,
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

export default RecenterButton;