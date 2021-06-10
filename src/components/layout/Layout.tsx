import React, { ReactNode } from "react";

import Navbar from "./Navbar";

const Layout = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <Navbar />
            <div className="container">{children}</div>
        </>
    );
};

export default Layout;
