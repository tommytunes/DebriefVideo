import { useEffect, useRef } from "react";
import { useVideo } from "../../contexts/VideoContext";

const OpenDashboard = () => {
    const { state, dispatch } = useVideo();
    const stateRef = useRef(state);
    stateRef.current = state;

    useEffect(() => {
        window.electronAPI.openDashboard(() => dispatch({type: 'TOGGLE_DASHBOARD'}))
    }, []);
}

export default OpenDashboard;