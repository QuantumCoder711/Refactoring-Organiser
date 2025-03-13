import React from 'react';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <main>
            This is admin layout
            <Outlet />
        </main>
    )
}

export default Layout;
