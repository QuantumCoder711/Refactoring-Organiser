import useEventStore from '@/store/eventStore';
import useAuthStore from '@/store/authStore';
import useAttendeeStore from '@/store/attendeeStore';
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AttendeeType } from '@/types';
import Wave from '@/components/Wave';
import PrintBadge from '@/components/PrintBadge';
import GoBack from '@/components/GoBack';

const PrintBadges: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const event = useEventStore(state => state.getEventBySlug(slug));
    const { token } = useAuthStore(state => state);
    const { singleEventAttendees, getSingleEventAttendees, loading } = useAttendeeStore(state => state);

    useEffect(() => {
        if (event && token)
            getSingleEventAttendees(token, event.uuid)
    }, [event, token]);

    const totalCheckedInAttendees: AttendeeType[] = singleEventAttendees.filter(attendee => attendee.check_in === 1 || attendee.check_in === 2 || attendee.check_in === 3 || attendee.check_in === 4);

    if (loading) {
        return <Wave />
    }

    return (
        <div className='w-full h-full'>
            <div className='flex items-center w-full gap-5 mb-10'>
                <GoBack />
                <h2 className='text-2xl font-semibold'>{event?.title}</h2>
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
