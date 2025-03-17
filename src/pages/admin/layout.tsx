import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
const Layout: React.FC = () => {
    return (
        <main className='h-screen overflow-hidden p-2 w-full flex flex-col flex-1'>
            <Navbar isAuthenticated={true} />

            <div className="flex flex-1">
                <aside className='bg-red-500 w-52 lg:w-56'></aside>
                <div className='border-2 border-yellow-500 flex-1 p-10'>
                    <Outlet />
                </div>
            </div>
        </main>
    )
}

export default Layout;