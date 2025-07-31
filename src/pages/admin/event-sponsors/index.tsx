import React from 'react'
import useEventStore from '@/store/eventStore';
import { EventType } from '@/types';
import { formatDateTime, getImageUrl } from '@/lib/utils';
import { MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';

const EventSponsors: React.FC = () => {
    const { events } = useEventStore(state => state);
    return (
        <div>
            <div className='flex gap-5 flex-wrap'>
                {
                    events.sort((a: any, b: any) => {
                        return new Date(b.event_start_date).getTime() - new Date(a.event_start_date).getTime();
                    }).map((event: EventType) => (
                        <div key={event.id} className='w-80 p-2 bg-brand-light-gray rounded-3xl'>
                            <div className='relative h-48'>
                                <img src={getImageUrl(event.image)} alt={event.title} className='rounded-2xl h-full w-full object-cover' />
                                {/* Overlay */}
                                <div className='absolute h-1/2 bottom-0 w-full bg-gradient-to-b from-black/0 rounded-xl via-black/40 to-black'>
                                <div className='border border-white rounded-full px-4 absolute bottom-2 left-2 text-white py-1 max-w-fit text-xs'>
                                    {formatDateTime(event.event_start_date)}
                                </div>
                                </div>
                            </div>
                            <div className='py-1 '>
                                <h3 className='text-sm uppercase font-medium text-nowrap text-ellipsis overflow-hidden'>
                                    {event.title}
                                </h3>
                                <div className='text-xs text-nowrap overflow-hidden text-ellipsis flex gap-1 items-center'>
                                    <MapPin width={8} height={12} className='!size-5 fill-black stroke-brand-light-gray' />
                                    <span className='overflow-hidden text-ellipsis'>
                                        {event.event_venue_name}
                                    </span>
                                </div>
                                <Separator />
                                <div className='flex justify-center mt-2 gap-2 text-sm'>
                                    <Link to={`/event-sponsors/${event.slug}`} className='bg-white rounded-full px-5 py-1 w-full grid place-content-center text-brand-primary'>View Sponsors</Link>
                                    <Link to={`/event-sponsors/add-sponsor/${event.slug}`} className='bg-white rounded-full px-5 py-1 w-full grid place-content-center text-brand-primary'>Add Sponsors</Link>
                                </div>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default EventSponsors;