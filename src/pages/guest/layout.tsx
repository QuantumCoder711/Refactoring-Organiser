import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const GuestLayout: React.FC = () => {
    return (
        <main className='w-full h-screen flex flex-col bg-brand-light'>
            <Navbar isAuthenticated={false} />
            <section className='flex-1 h-full overflow-y-scroll'>
                <Outlet />
            </section>
            <Footer />
        </main>
    )
}

export default GuestLayout;