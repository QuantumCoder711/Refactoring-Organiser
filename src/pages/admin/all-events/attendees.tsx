import useAttendeeStore from '@/store/attendeeStore';
import React, { useState, useMemo, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Eye, SquarePen, UserCheck, Trash, CircleX, CircleCheck, StarsIcon, X, Download } from 'lucide-react';

import useEventStore from '@/store/eventStore';
import Wave from '@/components/Wave';
import { cn, dateDifference, formatBreakOutTime, formatDateTimeReport, getImageUrl, isEventLive } from '@/lib/utils';

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
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
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
  const [notInvitedFilter, setNotInvitedFilter] = useState<number>(2);

  // Add selected attendees state
  const [selectedAttendees, setSelectedAttendees] = useState<Set<number>>(new Set());

  // Add pagination state
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const filteredAttendees = useMemo(() => {
    setCurrentPage(1);
    const filtered = singleEventAttendees.filter(attendee => {
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
      const notInvitedMatch = notInvitedFilter === 2 ? true : attendee.not_invited === notInvitedFilter;

      return nameMatch && companyMatch && designationMatch && checkInMatch && roleMatch && notInvitedMatch;
    });

    return filtered.sort((a, b) => {
      const timeA = new Date(a.check_in_time || 0).getTime();
      const timeB = new Date(b.check_in_time || 0).getTime();
      return timeB - timeA;
    });
  }, [singleEventAttendees, nameFilter, companyFilter, designationFilter, checkInFilter, roleFilter, notInvitedFilter]);

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
    (roleFilter !== '' && roleFilter !== 'all')

  // Buttons
  const links = [
    { name: "Add Attendee", url: `/all-events/add-attendee/${slug}` },
    { name: "Send Notifications", url: `/all-events/event/all-template-messages/${slug}` },
    { name: "Pending User Request", url: `/all-events/event/all-template-messages/pending-user-request/${slug}` },
  ];

  // Handle export to Excel with background colors using ExcelJS
  const handleExportToExcel = async () => {
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

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendees');

    // Define columns
    worksheet.columns = [
      // { header: 'Sr. No.', key: 'srNo', width: 5 },
      { header: 'Name', key: 'name', width: 40 },
      { header: 'Designation', key: 'designation', width: 40 },
      { header: 'Company', key: 'company', width: 40 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Alternate Email', key: 'alternateEmail', width: 40 },
      { header: 'Mobile', key: 'mobile', width: 40 },
      { header: 'Alternate Mobile', key: 'alternateMobile', width: 40 },
      { header: 'Role', key: 'role', width: 10 },
      { header: 'Award Winner', key: 'awardWinner', width: 25 },
      { header: 'Check In 1st', key: 'checkIn1st', width: 25 },
      { header: 'Check In 2nd', key: 'checkIn2nd', width: 25 },
      { header: 'Check In 3rd', key: 'checkIn3rd', width: 25 },
      { header: 'Check In 4th', key: 'checkIn4th', width: 25 },
      { header: 'Check In 5th', key: 'checkIn5th', width: 25 },
    ];

    // Style the header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    // Add data rows
    attendeesToExport.forEach((attendee) => {
      const row = worksheet.addRow({
        // srNo: index + 1,
        name: `${attendee.first_name || ''} ${attendee.last_name || ''}`.trim() || '-',
        designation: attendee.job_title || '-',
        company: attendee.company_name || '-',
        email: attendee.email_id || '-',
        alternateEmail: attendee.alternate_email || '-',
        mobile: attendee.phone_number || '-',
        alternateMobile: attendee.alternate_mobile_number || '-',
        role: attendee.status || '-',
        awardWinner: attendee.award_winner === 1 ? 'Yes' : 'No',
        checkIn1st: attendee.check_in === 1 ? (attendee.check_in_time ? formatDateTimeReport(attendee.check_in_time) : 'Yes') : 'No',
        checkIn2nd: dateDiff >= 1 ? (attendee.check_in_second === 1 ? (attendee.check_in_second_time ? formatDateTimeReport(attendee.check_in_second_time) : 'Yes') : 'No') : 'N/A',
        checkIn3rd: dateDiff >= 2 ? (attendee.check_in_third === 1 ? (attendee.check_in_third_time ? formatDateTimeReport(attendee.check_in_third_time) : 'Yes') : 'No') : 'N/A',
        checkIn4th: dateDiff >= 3 ? (attendee.check_in_forth === 1 ? (attendee.check_in_forth_time ? formatDateTimeReport(attendee.check_in_forth_time) : 'Yes') : 'No') : 'N/A',
        checkIn5th: dateDiff >= 4 ? (attendee.check_in_fifth === 1 ? (attendee.check_in_fifth_time ? formatDateTimeReport(attendee.check_in_fifth_time) : 'Yes') : 'No') : 'N/A',
      });

      // Apply yellow background if not_invited = 1
      if (attendee.not_invited === 1) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'fdfd7d' } // Light Yellow background
        };
      }

      // Apply green background if not_invited = 0 and check_in = 1
      if (attendee.not_invited === 0 && (attendee.check_in === 1 || attendee.check_in === 2 || attendee.check_in === 3 || attendee.check_in === 4 || attendee.check_in === 5)) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '78e55c' } // Light Green background
        };
      }
    });

    // Generate Excel file
    const fileName = `attendees_${new Date().toISOString().split('T')[0]}.xlsx`;

    try {
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);

      // Show success message
      toast('Export successful!', {
        className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleCheck className='size-5' />
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast('Export failed!', {
        className: "!bg-red-500 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
        icon: <CircleX className='size-5' />
      });
    }
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

      // Check if qr_code is already a full URL or a relative path
      const isFullUrl = event.qr_code.startsWith('http://') || event.qr_code.startsWith('https://');
      const imageUrl = isFullUrl ? event.qr_code : getImageUrl(event.qr_code);

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
      const response = await customCheckIn(uuid, event.uuid, event?.id, user?.id, token);
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
              (attendee.check_in_time ? <><strong>Y</strong> {formatDateTimeReport(attendee.check_in_time)}</> : "Checked In") :
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
              (attendee.check_in_second_time ? <><strong>Y</strong> {formatDateTimeReport(attendee.check_in_second_time)}</> : "Checked In") :
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
              (attendee.check_in_third_time ? <><strong>Y</strong> {formatDateTimeReport(attendee.check_in_third_time)}</> : "Checked In") :
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
              (attendee.check_in_forth_time ? <><strong>Y</strong> {formatDateTimeReport(attendee.check_in_forth_time)}</> : "Checked In") :
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
              (attendee.check_in_fifth_time ? <><strong>Y</strong> {formatDateTimeReport(attendee.check_in_fifth_time)}</> : "Checked In") :
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
    setSelectedSponsorsAttendees((prev) => prev.filter((item) => item.uuid !== uuid));
    try {
      const response = await axios.delete(`${domain}/api/delete-sponsor-attendee/${uuid}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });

      if (response.data.status === 200) {
        // setSelectedSponsorsAttendees((prev) => prev.filter((item) => item.uuid !== uuid));
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

      <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0'>
        <div className='flex flex-wrap items-center gap-3 sm:gap-5 w-full sm:w-auto'>
          <GoBack />
          <h1 className='text-xl font-semibold'>{event?.title}</h1>
        </div>

        <div className='flex flex-wrap items-center gap-3 sm:gap-5 w-full sm:w-auto justify-start sm:justify-end'>
          <Button
            className='!rounded-[10px] !px-3'
            onClick={handleExportToExcel}
          >
            {selectedAttendees.size > 0 ? `Export Selected (${selectedAttendees.size})` : 'Export Data'}
          </Button>

          {event?.event_mode == 0 && <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className='btn !rounded-[10px] !px-3'
                onClick={() => setIsQrDialogOpen(true)}
              >
                QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[90vw] max-w-[425px] p-4 sm:p-6">
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
          </Dialog>}
        </div>
      </div>

      {/* Buttons Row */}
      <div className='flex gap-3.5 mt-6 flex-wrap'>
        {links.map((link, index) => (
          <Link
            key={index}
            to={link?.url as string}
            // className={`btn ${link?.name !== 'Add Attendee' ? '' : ''} !rounded-[10px] !px-3 !h-[30px] w-fit text-nowrap text-sm grid place-content-center`}
          >
            <Button variant={link.name !== 'Add Attendee' ? 'outline' : 'default'} className={cn(link.name !== 'Add Attendee' && 'dark:bg-muted')  }>
              {link?.name}
            </Button>
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className='bg-muted rounded-lg p-3 sm:p-5 mt-6 shadow-blur'>

        {/* Details Row */}
        <div className='flex flex-wrap items-center gap-2 sm:gap-3.5'>

          {/* Select Box for pagination */}
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="rounded-sm !w-fit !h-8 border flex items-center justify-center text-sm">
              <SelectValue placeholder={`${itemsPerPage}/Page`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="25">25</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="500">500</SelectItem>
            </SelectContent>
          </Select>

          {/* <span className=''>10/Page <ChevronDown /></span> */}
          <span className='font-semibold text-sm'>Total Attendees: {singleEventAttendees.length}</span>
          {/* <span className='font-semibold text-sm'>CheckIn 1st: {singleEventAttendees.length}</span> */}
          {isFilterActive && (
            <span className='font-semibold text-sm'>Search Result: {filteredAttendees.length}</span>
          )}
          {notInvitedFilter === 1 && <span className='font-semibold text-sm'>Not Invited: {singleEventAttendees.filter(attendee => attendee.not_invited === 1).length}</span>}
          {notInvitedFilter === 0 && <span className='font-semibold text-sm'>Invited: {singleEventAttendees.filter(attendee => attendee.not_invited === 0).length}</span>}
        </div>

        {/* Filters Bar */}
        <div className="w-full mt-4 flex flex-col gap-3">
          {/* Row 1: Search Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {/* Search By Name */}
            <Input
              className="!min-w-full !text-xs"
              placeholder="Search by name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />

            {/* Search By Company */}
            <Input
              className="!min-w-full !text-xs"
              placeholder="Search by company"
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
            />

            {/* Search By Designation */}
            <Input
              className="!min-w-full !text-xs"
              placeholder="Search by designation"
              value={designationFilter}
              onChange={(e) => setDesignationFilter(e.target.value)}
            />
          </div>

          {/* Row 2: Selects + Delete */}
          <div className="grid grid-cols-2 sm:flex gap-2.5">
            {/* Filter By Check-In */}
            <Select value={checkInFilter} onValueChange={setCheckInFilter}>
              <SelectTrigger className="!w-full sm:!max-w-36 !text-sm cursor-pointer !text-foreground">
                <SelectValue placeholder="Checked-In">
                  {checkInFilter === 'all'
                    ? 'Checked-In'
                    : checkInFilter === '1'
                      ? 'Yes'
                      : checkInFilter === '0'
                        ? 'No'
                        : 'Checked-In'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="!text-sm">
                <SelectItem value="all" className="cursor-pointer">All</SelectItem>
                <SelectItem value="1" className="cursor-pointer">Yes</SelectItem>
                <SelectItem value="0" className="cursor-pointer">No</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter By Not Invited */}
            <Select value={notInvitedFilter.toString()} onValueChange={(value) => setNotInvitedFilter(Number(value))}>
              <SelectTrigger className="!w-full sm:!max-w-36 !text-sm cursor-pointer !text-foreground">
                <SelectValue placeholder="Not Invited">
                  {notInvitedFilter === 2
                    ? 'All'
                    : notInvitedFilter === 1
                      ? 'Not Invited'
                      : notInvitedFilter === 0
                        ? 'Invited'
                        : 'All'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="!text-sm">
                <SelectItem value="2" className="cursor-pointer">All</SelectItem>
                <SelectItem value="1" className="cursor-pointer">Not Invited</SelectItem>
                <SelectItem value="0" className="cursor-pointer">Invited</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter By Role */}
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="!w-full sm:!max-w-36 !text-sm cursor-pointer text-foreground">
                <SelectValue placeholder="Role">
                  {roleFilter === 'all'
                    ? 'Role'
                    : roleFilter === 'delegate'
                      ? 'Delegate'
                      : roleFilter === 'speaker'
                        ? 'Speaker'
                        : roleFilter === 'sponsor'
                          ? 'Sponsor'
                          : roleFilter === 'panelist'
                            ? 'Panelist'
                            : roleFilter === 'moderator'
                              ? 'Moderator'
                              : 'Role'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="!text-sm">
                <SelectItem value="all" className="cursor-pointer">All Roles</SelectItem>
                <SelectItem value="delegate" className="cursor-pointer">Delegate</SelectItem>
                <SelectItem value="speaker" className="cursor-pointer">Speaker</SelectItem>
                <SelectItem value="sponsor" className="cursor-pointer">Sponsor</SelectItem>
                <SelectItem value="panelist" className="cursor-pointer">Panelist</SelectItem>
                <SelectItem value="moderator" className="cursor-pointer">Moderator</SelectItem>
              </SelectContent>
            </Select>

            {/* Delete Button */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant={"destructive"}
                  className="btn sm:w-fit text-white"
                  disabled={selectedAttendees.size === 0}
                >
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[90vw] max-w-[425px] p-4 sm:p-6">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete these attendees and remove their data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteSelected}
                    disabled={selectedAttendees.size === 0}
                    className="cursor-pointer !bg-brand-secondary hover:!bg-brand-secondary/80 transition-all duration-300 text-white"
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>



        <div className='overflow-x-auto'>
          <Table className='mt-4 min-w-[1000px] rounded-md'>
            {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
            <TableHeader className='bg-accent !rounded-[10px]'>
              <TableRow className='!text-base'>
                <TableHead className="text-left min-w-10 !px-2">
                  <Checkbox
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
                <TableHead className="text-left min-w-10 !px-2">Breakout Checkin</TableHead>
                <TableHead className="text-left min-w-10 !px-2">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAttendees.map((attendee: AttendeeType, index: number) => (
                <TableRow
                  key={attendee.id}
                  className={`${attendee.not_invited === 1 ? 'bg-secondary/10 hover:bg-secondary/20' : 'hover:bg-background/50'}`}
                >
                  <TableCell className="text-left min-w-10">
                    <Checkbox
                      checked={selectedAttendees.has(attendee.id)}
                      onCheckedChange={(checked) => handleSelectAttendee(attendee.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="text-left min-w-10 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell className="text-left min-w-10 capitalize">
                    {attendee.first_name && attendee.last_name ? `${attendee.first_name} ${attendee.last_name}` : "-"}
                  </TableCell>
                  <TableCell className="text-left min-w-10 !capitalize">
                    {attendee.job_title || "-"}
                  </TableCell>
                  <TableCell className="text-left min-w-10 !capitalize">
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
                  <TableCell className="text-left min-w-10 !capitalize">
                    {attendee.status || "-"}
                  </TableCell>
                  <TableCell className="text-left min-w-10">
                    {attendee.award_winner !== null && attendee.award_winner !== undefined
                      ? (attendee.award_winner === 1 ? "Yes" : "No")
                      : "-"}
                  </TableCell>
                  {renderCheckInData(attendee)}
                  <TableCell className="text-left min-w-10">
                    {!attendee.break_out_room_and_time ? '-' :
                      attendee.break_out_room_and_time.map((item, index) => (
                        <div key={index}>{formatBreakOutTime(item)}</div>
                      ))
                    }
                  </TableCell>
                  <TableCell className="min-w-10 flex items-center justify-end gap-1.5">

                    {attendee.status === "sponsor" &&

                      <Dialog>
                        <DialogTrigger onClick={() => handleGetSponsorsAttendee(event?.id as number, attendee.id)} className='cursor-pointer'><StarsIcon className='size-4 text-purple-600' /></DialogTrigger>
                        <DialogContent className="w-[90vw] max-w-md max-h-[80vh] overflow-y-auto p-4 sm:p-6">
                          {isLoading ? <Wave /> : <>
                            <DialogHeader className="space-y-4">
                              <div>
                                <DialogTitle className="text-2xl font-bold capitalize text-brand-primary">
                                  {attendee.first_name && attendee.last_name ? `${attendee.first_name} ${attendee.last_name}` : "-"}
                                </DialogTitle>
                                <div className="h-1 w-12 bg-brand-primary rounded-full"></div>
                              </div>
                              <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/30" />
                                <Input
                                  type="text"
                                  placeholder="Search attendees..."
                                  className="pl-10 w-full"
                                  value={searchQuery}
                                  onChange={(e) => setSearchQuery(e.target.value)}
                                />
                              </div>
                            </DialogHeader>

                            <DialogDescription className='flex items-center overflow-x-scroll gap-2'>
                              {selectedSponsorsAttendees.map((item) => (
                                <div key={item.attendee_id} className="flex items-center gap-2 mt-5 max-w-md">
                                  <div className="p-2 px-4 flex gap-2 items-center justify-center rounded-full min-w-fit !text-nowrap bg-brand-primary">
                                    <p className="text-white capitalize text-xs tracking-wider">
                                      {filteredAttendees.find((attendee: AttendeeType) => attendee.id === item.attendee_id)?.first_name + " " +
                                        filteredAttendees.find((attendee: AttendeeType) => attendee.id === item.attendee_id)?.last_name}
                                    </p>
                                    <X className="size-4 text-white cursor-pointer" onClick={() => handleSponsorAttendeeDelete(item.uuid)} />
                                  </div>
                                </div>
                              ))}
                            </DialogDescription>

                            <Table className="mt-4">
                              <TableHeader className="bg-brand-light">
                                <TableRow className="text-left">
                                  <TableHead>Sr. No.</TableHead>
                                  <TableHead>Name</TableHead>
                                  <TableHead>Company</TableHead>
                                  <TableHead className='text-right max-w-fit flex items-center justify-center'>
                                    <Checkbox
                                      id='select-all'
                                      name='select-all'
                                      checked={selectedSponsorsAttendees.length === filteredAttendees.filter((attendee: AttendeeType) => attendee.status !== "sponsor").length}
                                      className="mx-auto cursor-pointer border border-brand-dark-gray"
                                      onCheckedChange={(checked) => {
                                        if (checked) {
                                          setSelectedSponsorsAttendees(
                                            filteredAttendees.filter((attendee: AttendeeType) => attendee.status !== "sponsor").map((attendee: AttendeeType) => ({ uuid: attendee?.uuid as string, attendee_id: attendee.id }))
                                          )
                                        } else {
                                          setSelectedSponsorsAttendees([])
                                        }
                                      }}
                                    />
                                  </TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {filteredAttendees
                                  .filter((attendee: AttendeeType) => attendee.status !== "sponsor")
                                  .filter((attendee: AttendeeType) => {
                                    if (!searchQuery) return true;
                                    const search = searchQuery.toLowerCase();
                                    return (
                                      (attendee.first_name?.toLowerCase().includes(search) ||
                                        attendee.last_name?.toLowerCase().includes(search) ||
                                        attendee.company_name?.toLowerCase().includes(search) ||
                                        attendee.email_id?.toLowerCase().includes(search))
                                    );
                                  })
                                  .map((attendee: AttendeeType) => (
                                    <TableRow key={attendee.id} className="hover:bg-brand-lightest">
                                      <TableCell>{filteredAttendees.indexOf(attendee) + 1}</TableCell>
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
                      <DialogTrigger className='cursor-pointer'><Eye width={13} height={9} className='size-4 text-green-500' /></DialogTrigger>
                      <DialogContent className="max-w-md p-6">
                        <DialogHeader className="space-y-2">
                          <DialogTitle className="text-2xl font-bold text-brand-primary">
                            Attendee Details
                          </DialogTitle>
                          <div className="h-1 w-12 mx-auto sm:mx-0 bg-primary rounded-full"></div>
                        </DialogHeader>

                        <div className="mt-8 space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-foreground/30 uppercase tracking-wider">Name</h3>
                              <p className="text-sm sm:text-base font-medium text-foreground capitalize">{attendee.first_name} {attendee.last_name}</p>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-foreground/30 uppercase tracking-wider">Job Title</h3>
                              <p className="text-sm sm:text-base font-medium text-foreground capitalize">{attendee.job_title || '-'}</p>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-foreground/30 uppercase tracking-wider">Email</h3>
                              <p className="text-sm sm:text-base font-medium text-foreground">{attendee.email_id || '-'}</p>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-foreground/30 uppercase tracking-wider">Company</h3>
                              <p className="text-sm sm:text-base font-medium text-foreground capitalize">{attendee.company_name || '-'}</p>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-foreground/30 uppercase tracking-wider">Phone</h3>
                              <p className="text-sm sm:text-base font-medium text-foreground">{attendee.phone_number || '-'}</p>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-foreground/30 uppercase tracking-wider">Alternate Email</h3>
                              <p className="text-sm sm:text-base font-medium text-foreground">{attendee.alternate_email || '-'}</p>
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-foreground/30 uppercase tracking-wider">Status</h3>
                              <p className="text-sm sm:text-base font-medium text-foreground capitalize">{attendee.status || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {/* Edit Event */}
                    <Link to={`/all-events/${slug}/edit-attendee/${attendee.uuid}`} className=''><SquarePen className='size-4 text-yellow-500' /></Link>

                    {/* Custom Check-In User */}
                    {isEventLive(event) && <AlertDialog>
                      <AlertDialogTrigger className='cursor-pointer'>
                        <UserCheck width={10} height={11} className='fill-primary stroke-primary size-4' />
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
                          <AlertDialogAction className='cursor-pointer bg-primary hover:bg-primary/80 duration-300 transition-all text-white' onClick={() => handleCustomCheckIn(attendee.uuid)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>}

                    {/* Delete Attendee */}
                    <AlertDialog>
                      <AlertDialogTrigger className='cursor-pointer'>
                        <Trash width={9} height={11} className='text-destructive size-4' />
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
                          <AlertDialogAction className='cursor-pointer hover:bg-destructive/80 duration-300 transition-all bg-destructive text-white' onClick={() => handleDeleteAttendee(attendee.id)}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <Pagination className='mt-[26px] flex justify-center sm:justify-end'>
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