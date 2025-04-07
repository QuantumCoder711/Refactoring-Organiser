import { Button } from '@/components/ui/button';
import DummyCardImage from '@/assets/dummyCardImg.png';
import React from 'react';
import EventCard from '@/components/EventCard';
import useEventStore from '@/store/eventStore';
import useAttendeeStore from '@/store/attendeeStore';

const Dashboard: React.FC = () => {

  const {events} = useEventStore();
  const {allEventsAttendees} = useAttendeeStore();

  return (
    <div>
      {/* Events Information */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {[
          { title: 'Total Events', value: events.length },
          { title: 'Total Attendees', value: allEventsAttendees.length },
          { title: 'Total Sponsers', value: '10' },
          { title: 'Upcoming Events', value: '10' }
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
            <div className='max-w-[405px]'>
              <EventCard
              uuid='1'
                title='Telecom Summit & Awards 2025! (Webinar)'
                location='Hotel Le-Meridien Hotel(Sovereign - 1), New-Delhi'
                date='15-Feb-2025'
                image={DummyCardImage}
                imageAlt='Event Image'
                isLive={true}
              />
            </div>

            <div className='max-w-[405px]'>
              <EventCard
              uuid='2'
                title='Telecom Summit & Awards 2025! (Webinar)'
                location='Hotel Le-Meridien Hotel(Sovereign - 1), New-Delhi'
                date='15-Feb-2025'
                image={DummyCardImage}
                imageAlt='Event Image'
                // isLive={true}
              />
            </div>
          </div>
        </div>

        {/* Past Events */}
        <div className='mt-8'>
          <div className='flex justify-between items-center'>
            <h2 className='text-xl font-semibold'>Past Events</h2>
            <Button className='btn'>View All</Button>
          </div>

          <div className='mt-5 flex gap-10'>
            <div className='max-w-[405px]'>
              <EventCard
              uuid='3'
                title='Telecom Summit & Awards 2025! (Webinar)'
                location='Hotel Le-Meridien Hotel(Sovereign - 1), New-Delhi'
                date='15-Feb-2025'
                image={DummyCardImage}
                imageAlt='Event Image'
                // isLive={true}
              />
            </div>

            <div className='max-w-[405px]'>
              <EventCard
              uuid='4'
                title='Telecom Summit & Awards 2025! (Webinar)'
                location='Hotel Le-Meridien Hotel(Sovereign - 1), New-Delhi'
                date='15-Feb-2025'
                image={DummyCardImage}
                imageAlt='Event Image'
                // isLive={true}
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Dashboard;