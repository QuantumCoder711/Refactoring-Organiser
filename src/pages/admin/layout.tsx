import React, { useLayoutEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import useAuthStore from '@/store/authStore';
import useAttendeeStore from '@/store/attendeeStore';
import useEventStore from '@/store/eventStore';
import Wave from '@/components/Wave';

const Layout: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const token = useAuthStore((state) => state.token);
    const { events, getAllEvents } = useEventStore();
    const { allEventsAttendees, getAllEventsAttendees } = useAttendeeStore();

    useLayoutEffect(() => {
        setLoading(true);
        if (token) {
            getAllEvents(token);
            getAllEventsAttendees(token);
        }
        setLoading(false);
        console.log("The data is: ", events, allEventsAttendees);
    }, [token]);

    if(loading) {
        return (
            <div className='w-full h-screen grid place-content-center'>
                <Wave />
            </div>
        )
    }

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