import useAttendeeStore from '@/store/attendeeStore';
import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronDown, Eye, SquarePen, UserCheck, Trash, CircleX, CircleCheck } from 'lucide-react';
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

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import useAuthStore from '@/store/authStore';
import { toast } from 'sonner';



const Attendees: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = useEventStore(state => state.getEventBySlug(slug));
  const { token } = useAuthStore(state => state);
  const { allEventsAttendees, loading, deleteAttendee } = useAttendeeStore(state => state);

  const buttons: string[] = [
    "Add Attendee",
    "Send Reminder",
    "Send Poll",
    "Send in App Message",
    "Pending User Request",
    "Send Template Message",
    "Thank You message"
  ];

  const handleDeleteAttendee = async (id: number) => {
    if(token) {
      const response = await deleteAttendee(id, token);
      if(response.status === 200) {
        toast(response.message, {
          className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheck className='size-5' />
        });
      } else {
        toast(response.message, {
          className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleX className='size-5' />
        });
      }
    }
  }

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
              <TableHead className="text-left min-w-10"><Checkbox className='bg-white border-brand-dark-gray cursor-pointer' /></TableHead>
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
                <TableCell className="text-left min-w-10"><Checkbox className='bg-white border-brand-dark-gray cursor-pointer' /></TableCell>
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
                <TableCell className="text-left min-w-10 flex items-center gap-1.5">

                  {/* For Viewing the Event */}
                  <Dialog>
                    <DialogTrigger className='cursor-pointer'><Eye width={12} height={9} /></DialogTrigger>
                    <DialogContent className="max-w-md p-6">
                      <DialogHeader className="space-y-2">
                        <DialogTitle className="text-2xl font-bold text-brand-primary">
                          Attendee Details
                        </DialogTitle>
                        <div className="h-1 w-12 bg-brand-primary rounded-full"></div>
                      </DialogHeader>

                      <div className="mt-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-1">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</h3>
                            <p className="text-base font-medium text-gray-800">{attendee.first_name} {attendee.last_name}</p>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Job Title</h3>
                            <p className="text-base font-medium text-gray-800">{attendee.job_title || '-'}</p>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</h3>
                            <p className="text-base font-medium text-gray-800">{attendee.email_id || '-'}</p>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</h3>
                            <p className="text-base font-medium text-gray-800">{attendee.company_name || '-'}</p>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone</h3>
                            <p className="text-base font-medium text-gray-800">{attendee.phone_number || '-'}</p>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Alternate Email</h3>
                            <p className="text-base font-medium text-gray-800">{attendee.alternate_email || '-'}</p>
                          </div>
                          <div className="space-y-1">
                            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</h3>
                            <p className="text-base font-medium text-gray-800 capitalize">{attendee.status || '-'}</p>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Edit Event */}
                  <Link to="#" className=''><SquarePen size={8.5} /></Link>

                  {/* Custom Check-In User */}
                  <AlertDialog>
                    <AlertDialogTrigger className='cursor-pointer'>
                      <UserCheck width={12} height={9} className='fill-brand-primary stroke-brand-primary' />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure want to mark this user as checked in ?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                        <AlertDialogAction className='cursor-pointer bg-brand-primary hover:bg-brand-primary text-white'>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>


                  {/* Delete Attendee */}
                  <AlertDialog>
                    <AlertDialogTrigger className='cursor-pointer'>
                      <Trash width={7} height={9} className='fill-brand-secondary stroke-brand-secondary' />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure want to delete {attendee.first_name} {attendee.last_name} ?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className='cursor-pointer'>Cancel</AlertDialogCancel>
                        <AlertDialogAction className='cursor-pointer bg-brand-secondary hover:bg-brand-secondary text-white' onClick={() => handleDeleteAttendee(attendee.id)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

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
