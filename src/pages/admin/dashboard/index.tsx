import React from 'react';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/EventCard';
import useEventStore from '@/store/eventStore';
import useAttendeeStore from '@/store/attendeeStore';
import useSponsorStore from '@/store/sponsorStore';
import { filterEvents, getImageUrl, isEventLive } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const { events } = useEventStore();
  const { allEventsAttendees } = useAttendeeStore();
  const { allEventsSponsors } = useSponsorStore();

  const { upcomingEvents, pastEvents } = filterEvents(events);
  return (
    <div>
      {/* Events Information */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[
          { title: 'Total Events', value: events.length },
          { title: 'Total Attendees', value: allEventsAttendees.length },
          { title: 'Total Sponsers', value: allEventsSponsors.length },
          { title: 'Upcoming Events', value: upcomingEvents.length }
        ].map((card, index) => (
          <div
            key={index}
            className='min-w-40 cursor-pointer duration-300 hover:bg-brand-background rounded-lg h-9 px-4 shadow-blur flex justify-between items-center'
          >
            <span>{card.title}</span>
            <span>{card.value}</span>
          </div>
        ))}
      </div>

      {/* All Events */}
      <div className='mt-8'>
        {/* Upcoming Events */}
        <div>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Upcoming Events</h2>
            <Button className='btn'>View All</Button>
          </div>

          <div className='mt-5 flex gap-10'>
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.uuid} className='max-w-[405px]'>
                <EventCard
                  slug={event.slug}
                  title={event.title}
                  location={event.event_venue_address_2}
                  date={event.event_date}
                  image={getImageUrl(event.image)}
                  imageAlt={event.title}
                  isLive={isEventLive(event)}
                  id={event.id}
                />
              </div>
            ))
            }
          </div>
        </div>

        {/* Past Events */}
        <div className='mt-8'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Past Events</h2>
            <Button className='btn'>View All</Button>
          </div>

          <div className='mt-5 flex gap-10'>
            {pastEvents.slice(0, 3).map((event) => (
              <div key={event.uuid} className='max-w-[405px]'>
                <EventCard
                  slug={event.slug}
                  title={event.title}
                  location={event.event_venue_address_2}
                  date={event.event_date}
                  image={getImageUrl(event.image)}
                  imageAlt={event.title}
                  isLive={isEventLive(event)}
                  id={event.id}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard;