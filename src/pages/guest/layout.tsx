import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const GuestLayout: React.FC = () => {
    const path = useLocation().pathname;

    return (
        <main className='w-full h-screen flex flex-col bg-brand-light'>
            <Navbar isAuthenticated={false} />
            {path === "/" && <section className='flex-1 h-full overflow-y-scroll'>
                <div>
                    <Outlet />
                    {path === "/" && <Footer type='styled' />}
                </div>
            </section>}

            {path !== "/" && <section className='flex-1 h-full overflow-y-scroll'>
                <Outlet />
                {(path !== "/" && path !== "/organiser/event") && <Footer type='basic' />}
            </section>}
        </main>
    )
}

export default GuestLayout;