import useAttendeeStore from '@/store/attendeeStore';
import React from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import useEventStore from '@/store/eventStore';
import Wave from '@/components/Wave';

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendeeType } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';

const Attendees: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = useEventStore(state => state.getEventBySlug(slug));
  const { allEventsAttendees, loading } = useAttendeeStore(state => state);

  const buttons: string[] = [
    "Add Attendee",
    "Send Reminder",
    "Send Poll",
    "Send in App Message",
    "Pending User Request",
    "Send Template Message",
    "Thank You message"
  ];

  if (loading) return <Wave />

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

      {/* Buttons Row */}
      <div className='flex gap-3.5 mt-6'>
        {buttons.map((button, index) => (
          button === "Add Attendee" ? <Button key={index} className='btn !rounded-[10px] !px-3 !h-[30px]'>{button}</Button> : <Button key={index} className='btn !bg-brand-background !text-black font-semibold !rounded-[10px] !px-3 !h-[30px]'>{button}</Button>
        ))}
      </div>

      {/* Table */}
      <div className='bg-brand-background rounded-lg p-5 mt-[74px] shadow-blur'>

        {/* Details Row */}
        <div className='flex gap-3.5'>
          <span className='rounded-sm !w-[83px] !h-[21px] border-1 border-brand-light-gray flex items-center justify-center text-sm'>10/Page <ChevronDown /></span>
          <span className='font-semibold text-sm'>Total Attendees: {allEventsAttendees.length}</span>
          <span className='font-semibold text-sm'>CheckIn 1st: {allEventsAttendees.length}</span>
          <span className='font-semibold text-sm'>Search Result: {allEventsAttendees.length}</span>
        </div>

        <Table className='mt-[68px]'>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader className='bg-brand-light-gray rounded-[10px]'>
            <TableRow>
              <TableHead className="text-left min-w-10"><Checkbox className='bg-white border-brand-dark-gray cursor-pointer'/></TableHead>
              <TableHead className="text-left min-w-10">Sr.No</TableHead>
              <TableHead className="text-left min-w-10">Name</TableHead>
              <TableHead className="text-left min-w-10">Desig...</TableHead>
              <TableHead className="text-left min-w-10">Comp...</TableHead>
              <TableHead className="text-left min-w-10">Email</TableHead>
              <TableHead className="text-left min-w-10">A. Email</TableHead>
              <TableHead className="text-left min-w-10">Mobile</TableHead>
              <TableHead className="text-left min-w-10">A. Mo...</TableHead>
              <TableHead className="text-left min-w-10">Role</TableHead>
              <TableHead className="text-left min-w-10">Award...</TableHead>
              <TableHead className="text-left min-w-10">Check...</TableHead>
              <TableHead className="text-left min-w-10">Check...</TableHead>
              <TableHead className="text-left min-w-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allEventsAttendees.map((attendee: AttendeeType, index: number) => (
              <TableRow key={attendee.id}>
                <TableCell className="text-left min-w-10"><Checkbox className='bg-white border-brand-dark-gray cursor-pointer'/></TableCell>
                <TableCell className="text-left min-w-10 font-medium">{index + 1}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.first_name + " " + attendee.last_name}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.job_title}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.company_name}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.email_id}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.alternate_email}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.phone_number}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.alternate_mobile_number}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.status}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.award_winner}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.check_in}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.check_in}</TableCell>
                <TableCell className="text-left min-w-10">
                  
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Attendees;
