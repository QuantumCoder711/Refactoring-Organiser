import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
const Layout: React.FC = () => {
    return (
        <main className='h-screen overflow-hidden w-full flex flex-col flex-1'>
            <Navbar isAuthenticated={true} />

            <section className="flex flex-1">
                <aside className='w-52 lg:w-56'></aside>
                <div className='flex-1 p-10'>
                    <Outlet />
                </div>
            </section>
        </main>
    )
}

export default Layout;