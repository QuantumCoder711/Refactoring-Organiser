import GoBack from '@/components/GoBack';
import EventForm from '@/components/EventForm';
import React from 'react'
import useEventStore from '@/store/eventStore';
import { useParams } from 'react-router-dom';

const UpdateEvent: React.FC = () => {

    const { slug } = useParams<{ slug: string }>();
    const event = useEventStore((state) => state.getEventBySlug(slug));

    console.log(event);

    return (
        <div className='relative w-full'>
            <div className='absolute top-0 left-0'>
                <GoBack />
            </div>

            <EventForm  />
        </div>
    )
}

export default UpdateEvent;
