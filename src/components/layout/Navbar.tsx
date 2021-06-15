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
                            Generals.io 3D Replay<span className={style.versionNumber}>v1.4.0</span>
                        </Link>
                    </div>
                </div>
                <ul>
                    <li>
                        <a
                            href="https://github.com/lachlansleight/GeneralsReplay3D"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Explore on GitHub
                        </a>
                    </li>
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
