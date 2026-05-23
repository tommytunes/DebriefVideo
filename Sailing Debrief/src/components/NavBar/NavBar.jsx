import { NavLink } from "react-router-dom";
import Settings from "./Settings";
import { useVideo } from '../../contexts/VideoContext';
import { FindTimelineStart } from "../../utils/FindTimelineStart";

export function NavBar() {
    const { state } = useVideo();
    const timelineStart = FindTimelineStart(state.videoGroups, state.audioGroups, state.dataGroups);
    return(
        <div className="navbar min-h-0 py-1 bg-base-100 shadow-sm">
            <div className="navbar-start">
                <NavLink to="/" className="btn btn-ghost btn-sm text-base" end>Video Player</NavLink>
                <NavLink to="/files" className="btn btn-ghost btn-sm text-base" end>Files</NavLink>
            </div>
            <div className="navbar-end pr-4">
                <div className="pr-4">
                    {state.currentTime != 0 && isFinite(timelineStart) && <p>{new Date(state.currentTime * 1000 + timelineStart).toLocaleTimeString()}</p>}
                </div>
                <Settings />
            </div>
        </div>
    );
}

export default NavBar;