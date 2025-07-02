import useEventStore from '@/store/eventStore';
import useAuthStore from '@/store/authStore';
import useAttendeeStore from '@/store/attendeeStore';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AttendeeType } from '@/types';
import Wave from '@/components/Wave';
import PrintBadge from '@/components/PrintBadge';
import GoBack from '@/components/GoBack';
import { Search } from 'lucide-react';
import { useState } from 'react';

const PrintBadges: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [searchQuery, setSearchQuery] = useState('');
    const event = useEventStore(state => state.getEventBySlug(slug));
    const { token } = useAuthStore(state => state);
    const { singleEventAttendees, getSingleEventAttendees, loading } = useAttendeeStore(state => state);

    useEffect(() => {
        if (event && token)
            getSingleEventAttendees(token, event.uuid)
    }, [event, token]);

    const totalCheckedInAttendees: AttendeeType[] = singleEventAttendees
        .filter(attendee => attendee.check_in === 1 || attendee.check_in === 2 || attendee.check_in === 3 || attendee.check_in === 4)
        .filter(attendee => 
            `${attendee.first_name} ${attendee.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())
        );

    if (loading) {
        return <Wave />
    }

    return (
        <div className='w-full h-full'>
            <div className='flex flex-col w-full gap-5 mb-10'>
                <div className='flex items-center gap-5'>
                    <GoBack />
                    <h2 className='text-2xl font-semibold'>{event?.title}</h2>
                </div>
                <div className='relative max-w-md w-full mx-auto'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400' />
                    <input
                        type='text'
                        placeholder='Search by name...'
                        className='w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand focus:border-transparent transition-all duration-200'
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className='flex w-full gap-5 flex-wrap'>
                {totalCheckedInAttendees.length > 0 ? totalCheckedInAttendees.map((attendee, index) => (
                    <PrintBadge key={index} attendee={attendee} print={true}/>
                )) : <div className='w-full h-full grid place-content-center text-2xl font-semibold text-brand-dark-gray'>No Attendees Found</div>}
            </div>
        </div>
    )
}

export default PrintBadges;
