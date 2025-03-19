import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';

const Layout: React.FC = () => {
    return (
        <main className='h-screen overflow-hidden w-full flex flex-col flex-1'>
            <Navbar isAuthenticated={true} />

            <section className="flex flex-1">
                <Sidebar />
                <div className='flex-1 p-5 md:p-10'>
                    <Outlet />
                </div>
            </section>
        </main>
    )
}

export default Layout;