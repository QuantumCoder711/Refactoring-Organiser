import GoBack from '@/components/GoBack';
import EventForm from '@/components/EventForm';
import React from 'react'
import useEventStore from '@/store/eventStore';
import { useParams } from 'react-router-dom';

const UpdateEvent: React.FC = () => {

    const { slug } = useParams<{ slug: string }>();
    const event = useEventStore((state) => state.getEventBySlug(slug));
    
    console.log(slug);
    if (!event) return;

    const data = {
        title: event.title,
        image: event.image,
        description: event.description,
        event_start_date: event.event_start_date,
        event_end_date: event.event_end_date,
        event_date: event.event_date,
        start_time: event.start_time,
        start_minute_time: event.start_minute_time,
        start_time_type: event.start_time_type,
        end_time: event.end_time,
        end_minute_time: event.end_minute_time,
        end_time_type: event.end_time_type,
        status: event.status,
        feedback: event.feedback,
        event_otp: event.event_otp,
        view_agenda_by: event.view_agenda_by,
        google_map_link: event.google_map_link,
        event_fee: event.event_fee,
        paid_event: event.paid_event,
        printer_count: event.printer_count,
        event_venue_name: event.event_venue_name,
        event_venue_address_1: event.event_venue_address_1,
        event_venue_address_2: event.event_venue_address_2,
        state: event.state,
        city: event.city,
        country: event.country,
        pincode: event.pincode,
    };

    return (
        <div className='relative w-full'>
            <div className='absolute top-0 left-0'>
                <GoBack />
            </div>

            <EventForm data={data} />
        </div>
    )
}

export default UpdateEvent;
