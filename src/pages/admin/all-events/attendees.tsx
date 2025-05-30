import useAttendeeStore from '@/store/attendeeStore';
import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, SquarePen, UserCheck, Trash, CircleX, CircleCheck, StarsIcon, X, Download } from 'lucide-react';

import useEventStore from '@/store/eventStore';
import Wave from '@/components/Wave';
import { dateDifference, formatDateTime, getImageUrl, isEventLive } from '@/lib/utils';

import {
  Table,
  TableBody,
  // TableCaption,
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
  DialogDescription,
  DialogFooter,
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
import GoBack from '@/components/GoBack';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import axios from 'axios';
import { domain } from '@/constants';
import QRCode from 'qrcode';

// Function to generate QR code data URL
const generateQRCodeDataUrl = async (url: string): Promise<string> => {
  try {
    return await QRCode.toDataURL(url, {
      width: 200,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
};


const Attendees: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const event = useEventStore(state => state.getEventBySlug(slug));
  const { token, user } = useAuthStore(state => state);
  const { singleEventAttendees, loading, deleteAttendee, customCheckIn, bulkDeleteAttendees, getSingleEventAttendees } = useAttendeeStore(state => state);

  // Date Difference State
  const [dateDiff, setDateDiff] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedSponsorsAttendees, setSelectedSponsorsAttendees] = useState<{ uuid: string, attendee_id: number }[]>([]);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState<boolean>(false);

  // Calculate date difference when event changes
  useEffect(() => {
    if (event?.event_start_date && event?.event_end_date) {
      const diff = dateDifference(event.event_start_date, event.event_end_date);
      setDateDiff(diff);
    }
  }, [event]);

  // Fetch attendees when component mounts or event changes
  useEffect(() => {
    if (event?.uuid && token) {
      getSingleEventAttendees(token, event.uuid);
    }
  }, [event?.uuid, token, getSingleEventAttendees]);

  // Filter states
  const [nameFilter, setNameFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [checkInFilter, setCheckInFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Add selected attendees state
  const [selectedAttendees, setSelectedAttendees] = useState<Set<number>>(new Set());

  // Add pagination state
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredAttendees = useMemo(() => {
    setCurrentPage(1);
    return singleEventAttendees.filter(attendee => {
      const nameMatch = `${attendee.first_name || ''} ${attendee.last_name || ''}`.toLowerCase().includes(nameFilter.toLowerCase());
      const companyMatch = attendee.company_name?.toLowerCase().includes(companyFilter.toLowerCase()) ?? false;

      // Handle null designation (job_title)
      const designationMatch = designationFilter === '' ||
        (attendee.job_title ?
          attendee.job_title.toLowerCase().includes(designationFilter.toLowerCase()) :
          designationFilter === '');

      const checkInMatch = checkInFilter === '' || checkInFilter === 'all' ||
        (checkInFilter === '1' && attendee.check_in === 1) ||
        (checkInFilter === '0' && attendee.check_in === 0);
      const roleMatch = roleFilter === '' || roleFilter === 'all' || attendee.status?.toLowerCase() === roleFilter.toLowerCase();

      return nameMatch && companyMatch && designationMatch && checkInMatch && roleMatch;
    });
  }, [singleEventAttendees, nameFilter, companyFilter, designationFilter, checkInFilter, roleFilter]);

  // Calculate paginated data
  const paginatedAttendees = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAttendees.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAttendees, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(filteredAttendees.length / itemsPerPage);
  }, [filteredAttendees.length, itemsPerPage]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Check if any filter is active
  const isFilterActive = nameFilter !== '' || companyFilter !== '' || designationFilter !== '' ||
    (checkInFilter !== '' && checkInFilter !== 'all') ||
    (roleFilter !== '' && roleFilter !== 'all');

  // Buttons
  const links = [
    { name: "Add Attendee", url: `/all-events/add-attendee/${slug}` },
    { name: "Send WhatsApp/E-Mail", url: `/all-events/event/all-template-messages/${slug}` },
    { name: "Pending User Request", url: `/all-events/event/all-template-messages/pending-user-request/${slug}` },
  ];

  // Handle export to Excel
  const handleExportToExcel = () => {
    // Use selected attendees if any, otherwise use filtered attendees
    const attendeesToExport = selectedAttendees.size > 0
      ? singleEventAttendees.filter(attendee => selectedAttendees.has(attendee.id))
      : filteredAttendees;

    if (attendeesToExport.length === 0) {
      toast('No data to export', {
        className: "!bg-yellow-500 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className='size-5' />
      });
      return;
    }

    // Prepare data for Excel
    const data = attendeesToExport.map((attendee, index) => ({
      'Sr. No.': index + 1,
      'Name': `${attendee.first_name || ''} ${attendee.last_name || ''}`.trim() || '-',
      'Designation': attendee.job_title || '-',
      'Company': attendee.company_name || '-',
      'Email': attendee.email_id || '-',
      'Alternate Email': attendee.alternate_email || '-',
      'Mobile': attendee.phone_number || '-',
      'Alternate Mobile': attendee.alternate_mobile_number || '-',
      'Role': attendee.status || '-',
      'Award Winner': attendee.award_winner === 1 ? 'Yes' : 'No',
      'Check In 1st': attendee.check_in === 1 ? (attendee.check_in_time ? formatDateTime(attendee.check_in_time) : 'Yes') : 'No',
      'Check In 2nd': dateDiff >= 1 ? (attendee.check_in_second === 1 ? (attendee.check_in_second_time ? formatDateTime(attendee.check_in_second_time) : 'Yes') : 'No') : 'N/A',
      'Check In 3rd': dateDiff >= 2 ? (attendee.check_in_third === 1 ? (attendee.check_in_third_time ? formatDateTime(attendee.check_in_third_time) : 'Yes') : 'No') : 'N/A',
      'Check In 4th': dateDiff >= 3 ? (attendee.check_in_forth === 1 ? (attendee.check_in_forth_time ? formatDateTime(attendee.check_in_forth_time) : 'Yes') : 'No') : 'N/A',
      'Check In 5th': dateDiff >= 4 ? (attendee.check_in_fifth === 1 ? (attendee.check_in_fifth_time ? formatDateTime(attendee.check_in_fifth_time) : 'Yes') : 'No') : 'N/A',
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Attendees');

    // Generate Excel file
    const fileName = `attendees_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    // Show success message
    toast('Export successful!', {
      className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
      icon: <CircleCheck className='size-5' />
    });
  };

  // Handle delete attendee
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

  // Handle custom check-in
  // Function to handle QR code download
  const handleDownloadQRCode = () => {
    if (!event?.qr_code) {
      console.error('No QR code available for this event');
      toast('No QR code available for this event', {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className='size-5' />
      });
      return;
    }

    try {
      console.log('Original QR code:', event.qr_code);
      
      // Check if qr_code is already a full URL or a relative path
      const isFullUrl = event.qr_code.startsWith('http://') || event.qr_code.startsWith('https://');
      const imageUrl = isFullUrl ? event.qr_code : getImageUrl(event.qr_code);
      
      console.log('Generated image URL:', imageUrl);
      
      // Create a temporary link with the direct image URL
      const link = document.createElement('a');
      link.href = imageUrl;
      link.target = '_blank'; // Open in new tab as a fallback
      link.rel = 'noopener noreferrer';
      
      // Set download attribute with a filename
      const fileName = `qrcode-${event.slug || 'event'}.png`;
      link.download = fileName;
      
      // Append to body, click and remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);

      console.log('QR code download initiated');
      toast('QR Code download started!', {
        className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleCheck className='size-5' />
      });
    } catch (error) {
      console.error('Error initiating QR code download:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error details:', { error });
      toast(`Failed to download QR Code: ${errorMessage}`, {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className='size-5' />
      });
    }
  };

  // Generate QR code when dialog opens
  useEffect(() => {
    if (!event) return;
    const generateQR = async () => {
      await generateQRCodeDataUrl(event.qr_code);
    };
    generateQR();
  }, [event]);

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
      // Only select the currently filtered attendees
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
        // Clear selected attendees after successful deletion
        setSelectedAttendees(new Set());
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

  // Generate check-in columns based on date difference
  const renderCheckInColumns = () => {
    const columns = [];
    if (dateDiff >= 0) {
      columns.push(
        <TableHead key="check-in-1" className="text-left min-w-10 !px-2">Checked In(1st)</TableHead>
      );
    }
    if (dateDiff >= 1) {
      columns.push(
        <TableHead key="check-in-2" className="text-left min-w-10 !px-2">Checked In(2nd)</TableHead>
      );
    }
    if (dateDiff >= 2) {
      columns.push(
        <TableHead key="check-in-3" className="text-left min-w-10 !px-2">Checked In(3rd)</TableHead>
      );
    }
    if (dateDiff >= 3) {
      columns.push(
        <TableHead key="check-in-4" className="text-left min-w-10 !px-2">Checked In(4th)</TableHead>
      );
    }
    if (dateDiff >= 4) {
      columns.push(
        <TableHead key="check-in-5" className="text-left min-w-10 !px-2">Checked In(5th)</TableHead>
      );
    }
    return columns;
  };

  // Generate check-in data cells based on date difference
  const renderCheckInData = (attendee: AttendeeType) => {
    const cells = [];
    if (dateDiff >= 0) {
      cells.push(
        <TableCell key="check-in-1" className="text-left min-w-10">
          {attendee.check_in !== null && attendee.check_in !== undefined ?
            (attendee.check_in === 1 ?
              (attendee.check_in_time ? <><strong>Y</strong> {formatDateTime(attendee.check_in_time)}</> : "Checked In") :
              "-") :
            "-"}
        </TableCell>
      );
    }
    if (dateDiff >= 1) {
      cells.push(
        <TableCell key="check-in-2" className="text-left min-w-10">
          {attendee.check_in_second !== null && attendee.check_in_second !== undefined ?
            (attendee.check_in_second === 1 ?
              (attendee.check_in_second_time ? <><strong>Y</strong> {formatDateTime(attendee.check_in_second_time)}</> : "Checked In") :
              "-") :
            "-"}
        </TableCell>
      );
    }
    if (dateDiff >= 2) {
      cells.push(
        <TableCell key="check-in-3" className="text-left min-w-10">
          {attendee.check_in_third !== null && attendee.check_in_third !== undefined ?
            (attendee.check_in_third === 1 ?
              (attendee.check_in_third_time ? <><strong>Y</strong> {formatDateTime(attendee.check_in_third_time)}</> : "Checked In") :
              "-") :
            "-"}
        </TableCell>
      );
    }
    if (dateDiff >= 3) {
      cells.push(
        <TableCell key="check-in-4" className="text-left min-w-10">
          {attendee.check_in_forth !== null && attendee.check_in_forth !== undefined ?
            (attendee.check_in_forth === 1 ?
              (attendee.check_in_forth_time ? <><strong>Y</strong> {formatDateTime(attendee.check_in_forth_time)}</> : "Checked In") :
              "-") :
            "-"}
        </TableCell>
      );
    }
    if (dateDiff >= 4) {
      cells.push(
        <TableCell key="check-in-5" className="text-left min-w-10">
          {attendee.check_in_fifth !== null && attendee.check_in_fifth !== undefined ?
            (attendee.check_in_fifth === 1 ?
              (attendee.check_in_fifth_time ? <><strong>Y</strong> {formatDateTime(attendee.check_in_fifth_time)}</> : "Checked In") :
              "-") :
            "-"}
        </TableCell>
      );
    }
    return cells;
  };

  const handleGetSponsorsAttendee = async (event_id: number, sponsor_id: number) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${domain}/api/get-sponsor-attendee`, {
        event_id,
        sponsor_id
      }, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data.status === 200) {
        setSelectedSponsorsAttendees(response.data.data);
      }
    } catch (error: any) {
      toast(error.response.data.message || "Something went wrong", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleSponsorAttendeeDelete = async (uuid: string) => {
    try {
      const response = await axios.delete(`${domain}/api/delete-sponsor-attendee/${uuid}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data.status === 200) {
        setSelectedSponsorsAttendees((prev) => prev.filter((item) => item.uuid !== uuid));
        toast(response.data.message, {
          className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheck className="size-5" />
        });
      }
    } catch (error: any) {
      toast(error.response.data.message || "Something went wrong", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />
      });
    }
  }

  const handleBulkSponsorAttendeeAdd = async (sponsor_id: number) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${domain}/api/add-multiple-sponsor-attendee`, {
        event_id: event?.id,
        sponsor_id,
        attendee_ids: selectedSponsorsAttendees.map((attendee) => attendee.attendee_id)
      }, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data.status === 200) {
        toast(response.data.message, {
          className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
          icon: <CircleCheck className="size-5" />
        });
      }
    } catch (error: any) {
      toast(error.response.data.message || "Something went wrong", {
        className: "!bg-red-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className="size-5" />
      });
    } finally {
      setIsLoading(false);
    }
  }

  if (loading) return <Wave />

  return (
    <div>

      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-5'>
          <GoBack />
          <h1 className='text-xl font-semibold'>{event?.title}</h1>
        </div>

        <div className='flex items-center gap-5'>
          <Button
            className='btn !rounded-[10px] !px-3'
            onClick={handleExportToExcel}
          >
            {selectedAttendees.size > 0 ? `Export Selected (${selectedAttendees.size})` : 'Export Data'}
          </Button>

          <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className='btn !rounded-[10px] !px-3'
                onClick={() => setIsQrDialogOpen(true)}
              >
                QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-center">Event Check-In QR Code</DialogTitle>
                <DialogDescription className="text-center">
                  Scan this QR code to check in to the event
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center justify-center py-4">
                <div className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                  {event?.qr_code ? (
                    <img
                      src={getImageUrl(event?.qr_code)}
                      alt="QR Code"
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-gray-500">
                      Generating QR code...
                    </div>
                  )}
                </div>
                <p className="mt-4 text-sm text-gray-500">{event?.title}</p>
              </div>
              <DialogFooter className="sm:justify-center">
                <Button
                  onClick={handleDownloadQRCode}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download QR Code
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Buttons Row */}
      <div className='flex gap-3.5 mt-6 flex-wrap'>
        {links.map((link, index) => (
          <Link
            key={index}
            to={link?.url as string}
            className={`btn ${link?.name !== 'Add Attendee' ? '!bg-brand-background !text-black font-semibold' : ''} !rounded-[10px] !px-3 !h-[30px] w-fit text-nowrap text-sm grid place-content-center`}
          >
            {link?.name}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className='bg-brand-background rounded-lg p-5 mt-6 shadow-blur'>

        {/* Details Row */}
        <div className='flex gap-3.5'>

          {/* Select Box for pagination */}
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="rounded-sm !w-fit !h-[21px] border-1 border-brand-light-gray flex items-center justify-center text-sm">
              <SelectValue placeholder={`${itemsPerPage}/Page`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>

          {/* <span className=''>10/Page <ChevronDown /></span> */}
          <span className='font-semibold text-sm'>Total Attendees: {singleEventAttendees.length}</span>
          {/* <span className='font-semibold text-sm'>CheckIn 1st: {singleEventAttendees.length}</span> */}
          {isFilterActive && (
            <span className='font-semibold text-sm'>Search Result: {filteredAttendees.length}</span>
          )}
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
              <SelectValue placeholder="Checked-In">
                {checkInFilter === 'all' ? 'Checked-In' : checkInFilter === '1' ? 'Yes' : checkInFilter === '0' ? 'No' : 'Checked-In'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className='!text-sm !font-semibold'>
              <SelectItem value="all" className='cursor-pointer'>All</SelectItem>
              <SelectItem value="1" className='cursor-pointer'>Yes</SelectItem>
              <SelectItem value="0" className='cursor-pointer'>No</SelectItem>
            </SelectContent>
          </Select>

          {/* Filter By Role */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="input !w-fit !h-[30px] !text-sm !font-semibold cursor-pointer !text-black">
              <SelectValue placeholder="Role">
                {roleFilter === 'all' ? 'Role' :
                  roleFilter === 'delegate' ? 'Delegate' :
                    roleFilter === 'speaker' ? 'Speaker' :
                      roleFilter === 'sponsor' ? 'Sponsor' :
                        roleFilter === 'panelist' ? 'Panelist' :
                          roleFilter === 'moderator' ? 'Moderator' : 'Role'}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className='!text-sm !font-semibold'>
              <SelectItem value="all" className='cursor-pointer'>All Roles</SelectItem>
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
          {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
          <TableHeader className='bg-brand-light-gray !rounded-[10px]'>
            <TableRow className='!text-base'>
              <TableHead className="text-left min-w-10 !px-2">
                <Checkbox
                  className='bg-white border-brand-dark-gray cursor-pointer'
                  checked={filteredAttendees.length > 0 && selectedAttendees.size === filteredAttendees.length}
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
              {renderCheckInColumns()}
              <TableHead className="text-left min-w-10 !px-2">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAttendees.map((attendee: AttendeeType, index: number) => (
              <TableRow key={attendee.id}>
                <TableCell className="text-left min-w-10">
                  <Checkbox
                    className='bg-white border-brand-dark-gray cursor-pointer'
                    checked={selectedAttendees.has(attendee.id)}
                    onCheckedChange={(checked) => handleSelectAttendee(attendee.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="text-left min-w-10 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell className="text-left min-w-10">
                  {attendee.first_name && attendee.last_name ? `${attendee.first_name} ${attendee.last_name}` : "-"}
                </TableCell>
                <TableCell className="text-left min-w-10">
                  {attendee.job_title || "-"}
                </TableCell>
                <TableCell className="text-left min-w-10">
                  {attendee.company_name || "-"}
                </TableCell>
                <TableCell className="text-left min-w-10">
                  {attendee.email_id || "-"}
                </TableCell>
                <TableCell className="text-left min-w-10">
                  {attendee.alternate_email || "-"}
                </TableCell>
                <TableCell className="text-left min-w-10">
                  {attendee.phone_number || "-"}
                </TableCell>
                <TableCell className="text-left min-w-10">
                  {attendee.alternate_mobile_number || "-"}
                </TableCell>
                <TableCell className="text-left min-w-10">
                  {attendee.status || "-"}
                </TableCell>
                <TableCell className="text-left min-w-10">
                  {attendee.award_winner !== null && attendee.award_winner !== undefined
                    ? (attendee.award_winner === 1 ? "Yes" : "No")
                    : "-"}
                </TableCell>
                {renderCheckInData(attendee)}
                <TableCell className="min-w-10 flex items-center justify-end gap-1.5">

                  {attendee.status === "sponsor" &&

                    <Dialog>
                      <DialogTrigger onClick={() => handleGetSponsorsAttendee(event?.id as number, attendee.id)} className='cursor-pointer'><StarsIcon className='size-4 text-purple-600' /></DialogTrigger>
                      <DialogContent className="max-w-md p-6">
                        {isLoading ? <Wave /> : <>
                          <DialogHeader className="space-y-2">
                            <DialogTitle className="text-2xl font-bold capitalize text-brand-primary">
                              {attendee.first_name && attendee.last_name ? `${attendee.first_name} ${attendee.last_name}` : "-"}
                            </DialogTitle>
                            <div className="h-1 w-12 bg-brand-primary rounded-full"></div>
                          </DialogHeader>

                          <DialogDescription className='flex items-center h-2 gap-2'>
                            {selectedSponsorsAttendees.map((item) => (
                              <div key={item.attendee_id} className="flex items-center gap-2 mt-5">
                                <div className="p-2 px-4 flex gap-2 items-center justify-center rounded-full bg-brand-primary">
                                  <p className="text-white capitalize text-xs tracking-wider">{paginatedAttendees.map((attendee: AttendeeType) => attendee.id === item.attendee_id && attendee.first_name + " " + attendee.last_name)}</p>
                                  <X className="size-4 text-white cursor-pointer" onClick={() => handleSponsorAttendeeDelete(item.uuid)} />
                                </div>
                              </div>
                            ))}
                          </DialogDescription>

                          <Table className="mt-4">
                            <TableHeader className="bg-brand-light">
                              <TableRow className="text-left">
                                <TableHead>Name</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead className='text-right max-w-fit flex items-center justify-center'>Action</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {paginatedAttendees.filter((attendee: AttendeeType) => attendee.status !== "sponsor").map((attendee: AttendeeType) => (
                                <TableRow key={attendee.id} className="hover:bg-brand-lightest">
                                  <TableCell className='capitalize'>{attendee.first_name && attendee.last_name ? `${attendee.first_name} ${attendee.last_name}` : "-"}</TableCell>
                                  <TableCell className='capitalize'>{attendee.company_name || "-"}</TableCell>
                                  <TableCell className="text-center max-w-fit flex items-center justify-center">
                                    <Checkbox
                                      id={String(attendee.id)}
                                      name="sponsor"
                                      checked={selectedSponsorsAttendees.find((item) => item.attendee_id === attendee.id) ? true : false}
                                      className="mx-auto cursor-pointer border border-brand-dark-gray"
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedSponsorsAttendees((prev) => [...prev, { uuid: event?.uuid as string, attendee_id: attendee.id }])
                                        } else {
                                          setSelectedSponsorsAttendees((prev) => [...prev].filter((item) => item.attendee_id !== attendee.id))
                                        }
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                          <DialogFooter>
                            <Button className='cursor-pointer btn' onClick={() => handleBulkSponsorAttendeeAdd(attendee.id)}>Save</Button>
                          </DialogFooter>
                        </>}
                      </DialogContent>
                    </Dialog>
                  }

                  {/* For Viewing the Event */}
                  <Dialog>
                    <DialogTrigger className='cursor-pointer'><Eye width={13} height={9} className='size-4' /></DialogTrigger>
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
                  <Link to={`/all-events/edit-attendee/${slug}/${attendee.uuid}`} className=''><SquarePen width={9.78} height={9.5} className='size-4' /></Link>

                  {/* Custom Check-In User */}
                  {isEventLive(event) && <AlertDialog>
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
                  </AlertDialog>}

                  {/* Delete Attendee */}
                  <AlertDialog>
                    <AlertDialogTrigger className='cursor-pointer'>
                      <Trash width={9} height={11} className='fill-brand-secondary stroke-brand-secondary size-4' />
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

        {/* Pagination */}
        <Pagination className='mt-[26px] flex justify-end'>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {/* Show first page */}
            {totalPages > 0 && (
              <PaginationItem>
                <PaginationLink
                  isActive={currentPage === 1}
                  onClick={() => handlePageChange(1)}
                  className="cursor-pointer"
                >
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Show ellipsis if needed */}
            {currentPage > 3 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Show current page and adjacent pages */}
            {totalPages > 1 && currentPage > 2 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="cursor-pointer"
                >
                  {currentPage - 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {totalPages > 1 && currentPage > 1 && currentPage < totalPages && (
              <PaginationItem>
                <PaginationLink
                  isActive={true}
                  className="cursor-pointer"
                >
                  {currentPage}
                </PaginationLink>
              </PaginationItem>
            )}

            {totalPages > 2 && currentPage < totalPages - 1 && (
              <PaginationItem>
                <PaginationLink
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="cursor-pointer"
                >
                  {currentPage + 1}
                </PaginationLink>
              </PaginationItem>
            )}

            {/* Show ellipsis if needed */}
            {currentPage < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}

            {/* Show last page */}
            {totalPages > 1 && (
              <PaginationItem>
                <PaginationLink
                  isActive={currentPage === totalPages}
                  onClick={() => handlePageChange(totalPages)}
                  className="cursor-pointer"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

      </div>

    </div>
  )
}

export default Attendees;
