import React, { useState } from 'react'
import useEventStore from '@/store/eventStore';
import { EventType } from '@/types';
import { formatDateTime, getImageUrl } from '@/lib/utils';
import { Globe, MapPin } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';

const EventSponsors: React.FC = () => {
    const { events } = useEventStore(state => state);
    const [searchTerm, setSearchTerm] = useState<string>("");

    return (
        <div>
            {/* Searchbar */}
            <div className="relative max-w-fit mb-10 mx-auto">
                <Input
                    type="text"
                    placeholder="Search for events..."
                    className="input !min-w-80 !text-base !bg-brand-background/80"
                    value={searchTerm}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                    }}
                />
                {searchTerm && (
                    <X
                        onClick={() => setSearchTerm('')}
                        className="w-4 h-4 absolute cursor-pointer right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700" />
                )}
            </div>
            <div className='flex gap-5 flex-wrap'>
                {
                    events.filter((event: EventType) => event.title.toLowerCase().includes(searchTerm.toLowerCase())).sort((a: any, b: any) => {
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
                                <div hidden={event.event_mode == 1} className='text-xs text-nowrap overflow-hidden text-ellipsis flex gap-1 items-center'>
                                    <MapPin width={8} height={12} className='!size-5 fill-black stroke-brand-light-gray' />
                                    <span className='overflow-hidden text-ellipsis'>
                                        {event.event_venue_name}
                                    </span>
                                </div>
                                <div hidden={event.event_mode == 0} className='text-xs text-nowrap overflow-hidden text-ellipsis flex gap-1 items-center'>
                                    <Globe width={8} height={12} className='!size-5 fill-black stroke-brand-light-gray' />
                                    <span className='overflow-hidden text-ellipsis'>
                                        Online
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