import useAttendeeStore from '@/store/attendeeStore';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import useEventStore from '@/store/eventStore';
import Wave from '@/components/Wave';

const Attendees: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = useEventStore(state=>state.getEventBySlug(slug));
  const attendees = useAttendeeStore(state=>state.allEventsAttendees);

  if(attendees.length === 0) {
    return <Wave />
  }
  return (
    <div>
      
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-5'>
          <Button className='btn !bg-brand-background !text-black'><ChevronLeft />Back</Button>
          <h1 className='text-xl font-semibold'>{event?.title}</h1>
        </div>

        <div className='flex items-center gap-5'>
          <Button className='btn !rounded-[10px] !px-3'>Export Data</Button>
          <Button className='btn !rounded-[10px] !px-3'>QR Code</Button>
        </div>
      </div>
    </div>
  )
}

export default Attendees;
