import { NavLink } from "react-router-dom";

export function NavBar() {
    return(
        <div className="navbar bg-base-100 shadow-sm">
            <NavLink to="/" className="btn btn-ghost text-xl" end>Video Player</NavLink>
            <NavLink to="/files" className="btn btn-ghost text-xl" end>Files</NavLink>
        </div>
    );
}

export default NavBar;