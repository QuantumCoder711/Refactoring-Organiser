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
            <footer className='w-full h-10 bg-brand-primary text-white text-center flex items-center justify-center'>
                <p className='text-sm'>© 2025 Event Management System. All rights reserved.</p>
            </footer>
        </main>
    )
}

export default GuestLayout;