import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
const Layout: React.FC = () => {
    return (
        <main>
            <Navbar isAuthenticated={true} />
            This is admin layout
            <Outlet />
        </main>
    )
}

export default Layout;
