import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import EventCard from '@/components/EventCard';
import useEventStore from '@/store/eventStore';
import useAttendeeStore from '@/store/attendeeStore';
import useSponsorStore from '@/store/sponsorStore';
import { filterEvents, getImageUrl, isEventLive } from '@/lib/utils';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { events, getAllEvents } = useEventStore(state=>state);
  const { allEventsAttendees, getAllEventsAttendees } = useAttendeeStore();
  const { allEventsSponsors, getAllEventsSponsors } = useSponsorStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get token from localStorage
        const tokenData = localStorage.getItem("klout-organiser-storage");
        const token = tokenData ? JSON.parse(tokenData).state.token : null;

        if (token) {
          // Fetch fresh data
          await Promise.all([
            getAllEvents(token),
            getAllEventsAttendees(token),
            getAllEventsSponsors(token)
          ]);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [getAllEvents, getAllEventsAttendees, getAllEventsSponsors]);

  const { upcomingEvents, pastEvents } = filterEvents(events);
  pastEvents.sort((a: any, b: any) => {
    return new Date(b.event_start_date).getTime() - new Date(a.event_start_date).getTime();
  });

  upcomingEvents.sort((a: any, b: any) => {
    return new Date(a.event_start_date).getTime() - new Date(b.event_start_date).getTime();
  });

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
            className='min-w-40 rounded-lg h-9 px-4 shadow-blur flex justify-between items-center'
          >
            <span>{card.title}</span>
            <span>{card.value}</span>
          </div>
        ))}
      </div>

      {/* All Events */}
      <div className='mt-10 space-y-10'>
        {/* Upcoming Events */}
        <div>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Upcoming Events</h2>
            <Link to='/all-events'><Button className='btn'>View All</Button></Link>
          </div>

          <div className='mt-5 flex gap-10'>
            {upcomingEvents.slice(0, 3).map((event) => (
              <div key={event.uuid} className='max-w-[405px]'>
                <EventCard
                  slug={event.slug}
                  title={event.title}
                  location={event.event_venue_address_2}
                  date={event.event_start_date}
                  image={getImageUrl(event.image)}
                  imageAlt={event.title}
                  isLive={isEventLive(event)}
                  id={event.id}
                  uuid={event.uuid}
                  total_attendees={event.total_attendee || 0}
                  total_checkedin_speaker={event.total_checkedin_speaker}
                  total_checkedin_sponsor={event.total_checkedin_sponsor}
                  total_pending_delegate={event.total_pending_delegate}
                  total_checked_in={event.total_checkedin}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Past Events */}
        <div>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Past Events</h2>
            <Link to='/all-events'><Button className='btn'>View All</Button></Link>
          </div>

          <div className='mt-5 flex gap-10'>
            {pastEvents.slice(0, 3).map((event) => (
              <div key={event.uuid} className='max-w-[405px]'>
                <EventCard
                  slug={event.slug}
                  title={event.title}
                  location={event.event_venue_address_2}
                  date={event.event_start_date}
                  image={getImageUrl(event.image)}
                  imageAlt={event.title}
                  isLive={isEventLive(event)}
                  id={event.id}
                  uuid={event.uuid}
                  total_attendees={event.total_attendee || 0}
                  total_checkedin_speaker={event.total_checkedin_speaker}
                  total_checkedin_sponsor={event.total_checkedin_sponsor}
                  total_pending_delegate={event.total_pending_delegate}
                  total_checked_in={event.total_checkedin}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;