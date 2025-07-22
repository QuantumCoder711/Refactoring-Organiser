import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import useAuthStore from '@/store/authStore';
import useAttendeeStore from '@/store/attendeeStore';
import useEventStore from '@/store/eventStore';
import Wave from '@/components/Wave';
import useSponsorStore from '@/store/sponsorStore';
import useCheckInSocket from "@/hooks/useCheckInSocket";

const Layout: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const token = useAuthStore((state) => state.token);
    const { getAllEvents } = useEventStore();
    const { getAllEventsAttendees } = useAttendeeStore();
    const { getAllEventsSponsors } = useSponsorStore();

    useEffect(() => {
        setLoading(true);
        if (token) {
            getAllEvents(token).then(()=>setLoading(false));
            getAllEventsAttendees(token);
            getAllEventsSponsors(token);
        } else {
            setLoading(false);
        }
    }, []);

    const events = useEventStore((state) => state.events);
    useCheckInSocket(events);

    if (loading) {
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