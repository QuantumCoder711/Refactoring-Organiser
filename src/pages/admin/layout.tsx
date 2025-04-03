import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import Footer from '@/components/Footer';

const Layout: React.FC = () => {
    return (
        <main className='h-screen overflow-hidden w-full flex flex-col flex-1'>
            <Navbar isAuthenticated={true} />

            <section className="flex flex-1 overflow-hidden">
                <Sidebar />
                <div className='flex-1 flex flex-col overflow-y-scroll'>
                    <div className='p-5 md:p-10 flex-1'>
                        <Outlet />
                    </div>
                    <Footer />
                </div>
            </section>
        </main>
    )
}

export default Layout;