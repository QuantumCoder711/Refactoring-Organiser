import { BarChartComponent } from '@/components/BarChart';
import GoBack from '@/components/GoBack';
import { HorizontalBarChartComponent } from '@/components/HorizontalBarChart';
import { PieChartComponent } from '@/components/PieChart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import useAttendeeStore from '@/store/attendeeStore';
import useAuthStore from '@/store/authStore';
import useEventStore from '@/store/eventStore';
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom';

const Charts: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { token } = useAuthStore(state => state);
  const event = useEventStore(state => state.getEventBySlug(slug));
  const { singleEventAttendees, getSingleEventAttendees } = useAttendeeStore(state => state);

  useEffect(() => {
    if (token && event?.uuid) {
      getSingleEventAttendees(token, event.uuid);
    }
  }, [token, slug, event]);


  const allCheckedInUsers = singleEventAttendees.filter(attendee => attendee.check_in === 1);
  const allNonCheckedInUsers = singleEventAttendees.filter(attendee => attendee.check_in === 0);

  console.log(allCheckedInUsers, allNonCheckedInUsers);

  return (
    <div className='flex justify-between h-full'>
      <GoBack />
      <div className='max-w-3xl rounded-[10px] min-h-full w-full bg-brand-background p-2'>
        <PieChartComponent checkedInUsers={allCheckedInUsers.length} nonCheckedInUsers={allNonCheckedInUsers.length} />
        <BarChartComponent />
        <Separator className='bg-black' />
        <HorizontalBarChartComponent />
      </div>
      <Button>Export Charts</Button>
    </div>
  )
}

export default Charts;
