import useAttendeeStore from '@/store/attendeeStore';
import React, { useState, useMemo } from 'react';
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
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


const Attendees: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = useEventStore(state => state.getEventBySlug(slug));
  const { token, user } = useAuthStore(state => state);
  const { allEventsAttendees, loading, deleteAttendee, customCheckIn, bulkDeleteAttendees } = useAttendeeStore(state => state);

  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [checkInFilter, setCheckInFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');

  // Add selected attendees state
  const [selectedAttendees, setSelectedAttendees] = useState<Set<number>>(new Set());

  // Filtered attendees
  const filteredAttendees = useMemo(() => {
    return allEventsAttendees.filter(attendee => {
      const nameMatch = `${attendee.first_name} ${attendee.last_name}`.toLowerCase().includes(nameFilter.toLowerCase());
      const companyMatch = attendee.company_name?.toLowerCase().includes(companyFilter.toLowerCase()) ?? false;
      const designationMatch = attendee.job_title?.toLowerCase().includes(designationFilter.toLowerCase()) ?? false;
      const checkInMatch = checkInFilter === '' || 
        (checkInFilter === '1' && attendee.check_in === 1) || 
        (checkInFilter === '0' && attendee.check_in === 0);
      const roleMatch = roleFilter === '' || attendee.status?.toLowerCase() === roleFilter.toLowerCase();

      return nameMatch && companyMatch && designationMatch && checkInMatch && roleMatch;
    });
  }, [allEventsAttendees, nameFilter, companyFilter, designationFilter, checkInFilter, roleFilter]);

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
    if (token) {
      const response = await deleteAttendee(id, token);
      if (response.status === 200) {
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


  const handleCustomCheckIn = async (uuid: string) => {
    if (token && event && user) {
      const response = await customCheckIn(uuid, event?.id, user?.id, token);
      if (response.status === 200) {
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

  // Handle checkbox selection
  const handleSelectAttendee = (id: number, isSelected: boolean) => {
    setSelectedAttendees(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setSelectedAttendees(new Set(filteredAttendees.map(attendee => attendee.id)));
    } else {
      setSelectedAttendees(new Set());
    }
  };

  // Handle delete selected
  const handleDeleteSelected = async () => {
    const selectedIds = Array.from(selectedAttendees);
    if (token && selectedIds.length > 0) {
      const response = await bulkDeleteAttendees(token, selectedIds);
      if (response.status === 200) {
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
  };

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
          <span className='font-semibold text-sm'>Search Result: {filteredAttendees.length}</span>
        </div>

        {/* Filters Bar */}
        <div className='flex w-full gap-2.5 mt-4'>
          {/* Search By Name */}
          <Input
            className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
            placeholder='Search by name'
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />

          {/* Search By Company */}
          <Input
            className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
            placeholder='Search by company'
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          />

          {/* Search By Designation */}
          <Input
            className='input !min-w-fit !max-w-fit !p-2.5 !text-xs'
            placeholder='Search by designation'
            value={designationFilter}
            onChange={(e) => setDesignationFilter(e.target.value)}
          />

          {/* Filter By Check-In */}
          <Select value={checkInFilter} onValueChange={setCheckInFilter}>
            <SelectTrigger className="input !w-[122px] !h-[30px] !text-sm !font-semibold cursor-pointer !text-black">
              <SelectValue placeholder="Check-IN" />
            </SelectTrigger>
            <SelectContent className='!text-sm !font-semibold'>
              <SelectItem value="1" className='cursor-pointer'>Yes</SelectItem>
              <SelectItem value="0" className='cursor-pointer'>No</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter By Role */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="input !w-fit !h-[30px] !text-sm !font-semibold cursor-pointer !text-black">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent className='!text-sm !font-semibold'>
              <SelectItem value="delegate" className='cursor-pointer'>Delegate</SelectItem>
              <SelectItem value="speaker" className='cursor-pointer'>Speaker</SelectItem>
              <SelectItem value="sponsor" className='cursor-pointer'>Sponsor</SelectItem>
              <SelectItem value="panelist" className='cursor-pointer'>Panelist</SelectItem>
              <SelectItem value="moderator" className='cursor-pointer'>Moderator</SelectItem>
            </SelectContent>
          </Select>

          <Button 
            className='btn !rounded-[10px] !p-2.5 !bg-brand-secondary text-white'
            onClick={handleDeleteSelected}
            disabled={selectedAttendees.size === 0}
          >
            Delete
          </Button>

        </div>

        <Table className='mt-4'>
          <TableCaption>A list of your recent invoices.</TableCaption>
          <TableHeader className='bg-brand-light-gray !rounded-[10px]'>
            <TableRow className='!text-base'>
              <TableHead className="text-left min-w-10 !px-2">
                <Checkbox 
                  className='bg-white border-brand-dark-gray cursor-pointer'
                  checked={selectedAttendees.size === filteredAttendees.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="text-left min-w-10 !px-2">Sr.No</TableHead>
              <TableHead className="text-left min-w-10 !px-2">Name</TableHead>
              <TableHead className="text-left min-w-10 !px-2">Designation</TableHead>
              <TableHead className="text-left min-w-10 !px-2">Company</TableHead>
              <TableHead className="text-left min-w-10 !px-2">Email</TableHead>
              <TableHead className="text-left min-w-10 !px-2">A. Email</TableHead>
              <TableHead className="text-left min-w-10 !px-2">Mobile</TableHead>
              <TableHead className="text-left min-w-10 !px-2">A. Mobile</TableHead>
              <TableHead className="text-left min-w-10 !px-2">Role</TableHead>
              <TableHead className="text-left min-w-10 !px-2">Award Winner</TableHead>
              <TableHead className="text-left min-w-10 !px-2">Check-IN(1st)</TableHead>
              <TableHead className="text-left min-w-10 !px-2">Check-IN(2nd)</TableHead>
              <TableHead className="text-left min-w-10 !px-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendees.map((attendee: AttendeeType, index: number) => (
              <TableRow key={attendee.id}>
                <TableCell className="text-left min-w-10">
                  <Checkbox 
                    className='bg-white border-brand-dark-gray cursor-pointer'
                    checked={selectedAttendees.has(attendee.id)}
                    onCheckedChange={(checked) => handleSelectAttendee(attendee.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="text-left min-w-10 font-medium">{index + 1}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.first_name + " " + attendee.last_name}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.job_title}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.company_name}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.email_id}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.alternate_email}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.phone_number}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.alternate_mobile_number}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.status}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.award_winner === 1 ? "Yes" : "No"}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.check_in}</TableCell>
                <TableCell className="text-left min-w-10">{attendee.check_in}</TableCell>
                <TableCell className="text-left min-w-10 flex items-center gap-1.5">

                  {/* For Viewing the Event */}
                  <Dialog>
                    <DialogTrigger className='cursor-pointer'><Eye width={13} height={9} /></DialogTrigger>
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
                  <Link to="#" className=''><SquarePen width={9.78} height={9.5} /></Link>

                  {/* Custom Check-In User */}
                  <AlertDialog>
                    <AlertDialogTrigger className='cursor-pointer'>
                      <UserCheck width={10} height={11} className='fill-brand-primary stroke-brand-primary' />
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
                        <AlertDialogAction className='cursor-pointer bg-brand-primary hover:bg-brand-primary text-white' onClick={() => handleCustomCheckIn(attendee.uuid)}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  {/* Delete Attendee */}
                  <AlertDialog>
                    <AlertDialogTrigger className='cursor-pointer'>
                      <Trash width={9} height={11} className='fill-brand-secondary stroke-brand-secondary' />
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