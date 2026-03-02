import { NavLink } from "react-router-dom";
import Settings from "./Settings";

export function NavBar() {
    return(
        <div className="navbar bg-base-100 shadow-sm">
            <div className="navbar-start">
                <NavLink to="/" className="btn btn-ghost text-xl" end>Video Player</NavLink>
                <NavLink to="/files" className="btn btn-ghost text-xl" end>Files</NavLink>
            </div>
            <div className="navbar-end pr-4">
                <Settings />
            </div>
        </div>
    );
}

export default NavBar;