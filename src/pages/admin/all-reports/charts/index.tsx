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
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { useRef } from 'react';
// import { toast } from 'sonner';
// import { CircleCheck, CircleX } from 'lucide-react';
import Wave from '@/components/Wave';

// Utility function to merge case-insensitive duplicates
const mergeCaseInsensitiveDuplicates = (items: string[]): string[] => {
  const caseMap = new Map<string, { original: string; count: number }>();

  // First pass: count occurrences of each case variation
  items.forEach(item => {
    const lowerCase = item?.toLowerCase();
    const existing = caseMap.get(lowerCase);
    if (existing) {
      existing.count++;
      // If this variant appears more times, use it as the preferred version
      if (items.filter(i => i === item).length > items.filter(i => i === existing.original).length) {
        existing.original = item;
      }
    } else {
      caseMap.set(lowerCase, { original: item, count: 1 });
    }
  });

  // Return the most common variant for each case-insensitive group
  return Array.from(caseMap.values()).map(entry => entry.original);
};

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

  // Get unique designations and merge case-insensitive duplicates
  const uniqueDesignations = mergeCaseInsensitiveDuplicates([...new Set(allCheckedInUsers.map((user: AttendeeType) => user.job_title))]);

  const designationCounts = uniqueDesignations.map((designation) => {
    return {
      label: designation,
      count: allCheckedInUsers.filter((user: AttendeeType) =>
        user.job_title?.toLowerCase() === designation?.toLowerCase()
      ).length
    };
  }).sort((a, b) => b.count - a.count);

  // Get unique companies and merge case-insensitive duplicates
  const uniqueCompanies = mergeCaseInsensitiveDuplicates([...new Set(allCheckedInUsers.map((user: AttendeeType) => user.company_name))]);

  const companyCounts = uniqueCompanies.map((company) => {
    return {
      label: company,
      count: allCheckedInUsers.filter((user: AttendeeType) =>
        user.company_name?.toLowerCase() === company?.toLowerCase()
      ).length
    };
  }).sort((a, b) => b.count - a.count);

  const handleExport = () => {
    setLoading(true);
    if (chartRef.current) {
      const element = chartRef.current;
      element.style.backgroundColor = 'white !important';

      // Use a scale factor to capture high-quality images without too large a file
      html2canvas(element, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');

        // Create a new jsPDF instance
        const pdf = new jsPDF('p', 'mm', 'a4');

        // A4 page size dimensions
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Scale the height based on aspect ratio

        // Define page height for A4
        const pageHeight = 295; // A4 page height in mm
        let yPosition = 0;

        // Add the first image to the PDF
        pdf.addImage(imgData, 'PNG', 0, yPosition, imgWidth, imgHeight);

        // Check if the image height exceeds the page height
        if (imgHeight > pageHeight) {
          let remainingHeight = imgHeight - pageHeight;
          let offset = pageHeight;

          // If the image is larger than the page, split it into multiple pages
          while (remainingHeight > 0) {
            // Add the next portion of the image
            pdf.addPage(); // New page for the next part
            pdf.addImage(imgData, 'PNG', 0, -offset, imgWidth, imgHeight);
            offset += pageHeight;
            remainingHeight -= pageHeight;
          }
        }

        // Save the final PDF after all content has been added
        pdf.save(`${event?.title} Chart.pdf`);
        setLoading(false); // Only set this after the export completes
      }).catch(() => {
        setLoading(false); // In case of an error, still stop loading
      });
    } else {
      setLoading(false); // In case the chartsWrapperRef is not set
    }
  };

  if (loading) {
    return <Wave />
  }

  return (
    <div className='flex flex-col h-full gap-4 p-4'>
      <div className='flex justify-between items-center'>
        <GoBack />
        <Button onClick={handleExport} className='bg-brand-primary hover:bg-brand-primary/90 cursor-pointer'>Export Charts</Button>
      </div>
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
          <HorizontalBarChartComponent chartData={designationCounts} bgColor="#6C7A89" title="Total Attendees by Designation" />
        </div>
      </div>
    </div>
  )
}

export default Charts;

