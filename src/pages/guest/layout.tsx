import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
const GuestLayout: React.FC = () => {
    return (
        <main className='w-full h-screen flex flex-col bg-brand-light'>
            <Navbar isAuthenticated={false} />
            <section className='flex-1'>
                <Outlet />
            </section>
        </main>
    )
}

export default GuestLayout;