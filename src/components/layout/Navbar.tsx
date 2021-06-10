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
                            APP TITLE<span className={style.versionNumber}>v0.0.1</span>
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