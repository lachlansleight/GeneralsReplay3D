import React from "react";
import { Link } from "react-router-dom";

import style from "./Navbar.module.scss";

const Navbar = () => {
    return (
        <nav className={style.mainNav}>
            <div className="container">
                <div className={style.logo}>
                    <div>
                        <Link to={`/`}>
                            Generals.io 3D Replay<span className={style.versionNumber}>v1.0.0</span>
                        </Link>
                    </div>
                </div>
                <ul>
                    <li>
                        <Link to={`/`}>Home</Link>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
