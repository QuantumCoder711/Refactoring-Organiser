import { BarChartComponent } from '@/components/BarChart';
import GoBack from '@/components/GoBack';
import { HorizontalBarChartComponent } from '@/components/HorizontalBarChart';
import { PieChartComponent } from '@/components/PieChart';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import useAttendeeStore from '@/store/attendeeStore';
import useAuthStore from '@/store/authStore';
import useEventStore from '@/store/eventStore';
import { AttendeeType } from '@/types';
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

  function generateHoursWithCheckins(startTime: string, endTime: string, attendees: AttendeeType[]) {
    function parseTime(timeStr: string) {
      const [time, period] = timeStr.split(" ");
      let [hours, minutes] = time.split(":").map(Number);
      return { hours, minutes, period };
    }

    const start = parseTime(startTime);
    const end = parseTime(endTime);

    const to24Hour = (hours: number, period: string) =>
      period === "PM" && hours !== 12 ? hours + 12 : period === "AM" && hours === 12 ? 0 : hours;

    let startHour = to24Hour(start.hours, start.period);
    const endHour = to24Hour(end.hours, end.period) + (end.minutes > 0 ? 1 : 0); // Round up for endTime

    // Count check-ins by hour
    const checkinsByHour: Record<number, number> = {};

    // Initialize all hours with 0 check-ins
    for (let hour = startHour; hour <= endHour; hour++) {
      checkinsByHour[hour] = 0;
    }

    // Count check-ins for each hour
    attendees.forEach(attendee => {
      if (attendee.check_in === 1 && attendee.check_in_time) {
        const checkInDate = new Date(attendee.check_in_time);
        const checkInHour = checkInDate.getHours();

        // Only count if the check-in hour is within our event hours
        if (checkInHour >= startHour && checkInHour <= endHour) {
          checkinsByHour[checkInHour] = (checkinsByHour[checkInHour] || 0) + 1;
        }
      }
    });

    // Create the final array of objects
    const timeArray = [];
    for (let hour = startHour; hour <= endHour; hour++) {
      let displayHour = hour % 12 === 0 ? 12 : hour % 12; // Convert back to 12-hour format
      let displayPeriod = hour < 12 || hour === 24 ? "AM" : "PM";
      timeArray.push({
        hour: `${displayHour} ${displayPeriod}`,
        totalCheckins: checkinsByHour[hour]
      });
    }

    return timeArray;
  }

  let start_time: string = event?.start_time + ":" + event?.start_minute_time + " " + event?.start_time_type;
  let end_time: string = event?.end_time + ":" + event?.end_minute_time + " " + event?.end_time_type;

  // Generate hours array with check-in counts
  let hoursArray = generateHoursWithCheckins(start_time, end_time, singleEventAttendees);

  const uniquesDesignations = [...new Set(allCheckedInUsers.map((user: AttendeeType) => user.job_title))];

  const designationCounts = uniquesDesignations.map((designation) => {
    return {
      label: designation,
      count: allCheckedInUsers.filter((user: AttendeeType) => user.job_title === designation).length
    };
  });

  const uniqueCompanies = [...new Set(allCheckedInUsers.map((user: AttendeeType) => user.company_name))];

  const companyCounts = uniqueCompanies.map((company) => {
    return {
      label: company,
      count: allCheckedInUsers.filter((user: AttendeeType) => user.company_name === company).length
    };
  });


  console.log(designationCounts, companyCounts);

  return (
    <div className='flex justify-between h-full'>
      <GoBack />
      <div className='max-w-3xl rounded-[10px] min-h-full w-full bg-brand-background p-2'>
        <PieChartComponent checkedInUsers={allCheckedInUsers.length} nonCheckedInUsers={allNonCheckedInUsers.length} />
        <BarChartComponent hoursArray={hoursArray} />

        <Separator className='bg-black' />
        <HorizontalBarChartComponent chartData={companyCounts} title="Total Attendees by Company" />

        <Separator className='bg-black' />
        <HorizontalBarChartComponent chartData={designationCounts} title="Total Attendees by Designation" />
      </div>
      <Button>Export Charts</Button>
    </div>
  )
}

export default Charts;
