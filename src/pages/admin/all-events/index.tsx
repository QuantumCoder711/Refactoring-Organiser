import EventCard from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import React, { useState } from 'react';
import useEventStore from '@/store/eventStore';
import { filterEvents, getImageUrl, isEventLive } from '@/lib/utils';

const AllEvents: React.FC = () => {

    const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');
    const { events } = useEventStore();

    const { upcomingEvents, pastEvents } = filterEvents(events);

    return (
        <div>
            {/* Tab and Pagination */}
            <div className='flex justify-between items-center'>
                <div className='flex gap-5'>
                    <Button
                        className={`btn !text-black !bg-brand-background hover:bg-brand-dark-gray rounded-[10px] ${activeTab === 'upcoming' ? '!bg-brand-dark-gray !text-white' : ''}`}
                        onClick={() => setActiveTab('upcoming')}>Upcoming Events</Button>
                    <Button
                        className={`btn !text-black !bg-brand-background hover:bg-brand-dark-gray rounded-[10px] ${activeTab === 'past' ? '!bg-brand-dark-gray !text-white' : ''}`}
                        onClick={() => setActiveTab('past')}>Past Events</Button>
                </div>

                <div>
                    Pagination
                </div>
            </div>

            {/* Upcoming Events */}
            {activeTab === 'upcoming' && <div className='mt-5 flex flex-wrap gap-6'>

                {upcomingEvents.map((event) => (
                    <EventCard
                        key={event.uuid}
                        title={event.title}
                        location={event.event_venue_address_2}
                        date={event.event_date}
                        image={getImageUrl(event.image)}
                        imageAlt={event.title}
                        isLive={isEventLive(event)}
                        slug={event.slug}
                        id={event.id}
                    />
                ))}
            </div>}


            {/* Past Events */}
            {activeTab === 'past' && <div className='mt-5'>
                {pastEvents.map((event) => (
                    <EventCard
                        key={event.uuid}
                        title={event.title}
                        location={event.event_venue_address_2}
                        date={event.event_date}
                        image={getImageUrl(event.image)}
                        imageAlt={event.title}
                        slug={event.slug}
                        id={event.id}
                    />
                ))}
            </div>}
        </div>
    )
}

export default AllEvents;
