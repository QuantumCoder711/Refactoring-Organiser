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
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useRef } from 'react';
import { toast } from 'sonner';
import { CircleCheck, CircleX } from 'lucide-react';
import Wave from '@/components/Wave';

const Charts: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { token } = useAuthStore(state => state);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const event = useEventStore(state => state.getEventBySlug(slug));
  const { singleEventAttendees, getSingleEventAttendees } = useAttendeeStore(state => state);
  const [loading, setLoading] = useState<boolean>(false);

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

  const handleExport = async () => {
    if (!chartRef.current) return;
    setLoading(true);
    try {
      // Set a higher scale for better quality
      const scale = 2; // Higher scale for better quality
      const width = chartRef.current.offsetWidth;
      const height = chartRef.current.scrollHeight;

      const dataUrl = await htmlToImage.toPng(chartRef.current, {
        quality: 1,
        width: width * scale,
        height: height * scale,
        style: {
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${width}px`,
          height: `${height}px`
        }
      });

      // Create PDF with proper orientation and margins
      const pdf = new jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculate dimensions to fit the page with margins
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10; // 10mm margin
      const contentWidth = pageWidth - 2 * margin;
      const contentHeight = pageHeight - 2 * margin;

      // Calculate aspect ratio to maintain proportions
      const imgAspectRatio = width / height;
      let imgWidth = contentWidth;
      let imgHeight = contentWidth / imgAspectRatio;

      // If the image is too tall for the page, scale it down
      if (imgHeight > contentHeight) {
        imgHeight = contentHeight;
        imgWidth = contentHeight * imgAspectRatio;
      }

      // Center the image on the page
      const x = margin + (contentWidth - imgWidth) / 2;
      const y = margin + (contentHeight - imgHeight) / 2;

      pdf.addImage(dataUrl, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`${event?.title || 'event'}-report.pdf`);

      toast.success('PDF exported successfully!', {
        className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleCheck className='size-5' />
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error exporting PDF. Please try again.', {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className='size-5' />
      });
    } finally {
      setLoading(false);
    }
  };

  if(loading) {
    return <Wave />
  }

  return (
    <div className='flex flex-col h-full gap-4 p-4'>
      <div className='flex justify-between items-center'>
        <GoBack />
        <Button onClick={handleExport} className='bg-brand-primary hover:bg-brand-primary/90 cursor-pointer'>Export Charts</Button>
      </div>
      {/* <div ref={chartRef} className='max-w-3xl rounded-[10px] min-h-full w-full bg-brand-background p-2'>
      <div 
          <PieChartComponent checkedInUsers={allCheckedInUsers.length} nonCheckedInUsers={allNonCheckedInUsers.length} />
          <BarChartComponent hoursArray={hoursArray} />
        
          <Separator className='bg-black' />
          <HorizontalBarChartComponent chartData={companyCounts} title="Total Attendees by Company" />
        
          <Separator className='bg-black' />
          <HorizontalBarChartComponent chartData={designationCounts} title="Total Attendees by Designation" />
        </div> */}
      <div
        ref={chartRef}
        className='max-w-3xl mx-auto rounded-[10px] bg-brand-background p-6 shadow-lg space-y-8 print:shadow-none print:p-2'
        style={{ minWidth: '800px' }}
      >
        <div className='flex justify-center w-full'>
          <div className='w-full max-w-2xl'>
            <PieChartComponent checkedInUsers={allCheckedInUsers.length} nonCheckedInUsers={allNonCheckedInUsers.length} />
          </div>
        </div>

        <Separator className='bg-gray-300 my-8' />

        <div className='w-full'>
          <BarChartComponent hoursArray={hoursArray} />
        </div>

        <Separator className='bg-gray-300 my-8' />

        <div className='w-full'>
          <HorizontalBarChartComponent chartData={companyCounts} title="Total Attendees by Company" />
        </div>

        <Separator className='bg-gray-300 my-8' />

        <div className='w-full'>
          <HorizontalBarChartComponent chartData={designationCounts} title="Total Attendees by Designation" />
        </div>
      </div>
    </div>
  )
}

export default Charts;

