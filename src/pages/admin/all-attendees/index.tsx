import React, { useState, useMemo, useEffect } from 'react';
import useAttendeeStore from '@/store/attendeeStore';
import useAuthStore from '@/store/authStore';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { CircleX, CircleCheck } from 'lucide-react';
import Wave from '@/components/Wave';
import { formatDateTime } from '@/lib/utils';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { AttendeeType } from '@/types';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import GoBack from '@/components/GoBack';

const AllAttendees: React.FC = () => {
    const { allEventsAttendees, loading, getAllEventsAttendees } = useAttendeeStore(state => state);
    const { token } = useAuthStore(state => state);

    // Fetch all attendees when component mounts
    useEffect(() => {
        if (token) {
            getAllEventsAttendees(token);
        }
    }, [getAllEventsAttendees, token]);

    // Filter states
    const [nameFilter, setNameFilter] = useState('');
    const [companyFilter, setCompanyFilter] = useState('');
    const [designationFilter, setDesignationFilter] = useState('');
    const [checkInFilter, setCheckInFilter] = useState<string>('all');
    const [roleFilter, setRoleFilter] = useState<string>('all');

    // Add pagination state
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const filteredAttendees = useMemo(() => {
        setCurrentPage(1);
        return allEventsAttendees.filter(attendee => {
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
    }, [allEventsAttendees, nameFilter, companyFilter, designationFilter, checkInFilter, roleFilter]);

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

    // Handle export to Excel
    const handleExportToExcel = () => {
        // Use filtered attendees for export
        const attendeesToExport = filteredAttendees;

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
            'LinkedIn URL': attendee.linkedin_page_link || '-',
            'Role': attendee.status || '-',
            'Award Winner': attendee.award_winner === 1 ? 'Yes' : 'No',
            'Check In': attendee.check_in === 1 ? (attendee.check_in_time ? formatDateTime(attendee.check_in_time) : 'Yes') : 'No',
        }));

        // Create workbook and worksheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);

        // Set column widths for better readability
        const wscols = [
            { wch: 10 },  // Sr. No.
            { wch: 25 },  // Name
            { wch: 25 },  // Designation
            { wch: 25 },  // Company
            { wch: 30 },  // Email
            { wch: 30 },  // Alternate Email
            { wch: 15 },  // Mobile
            { wch: 15 },  // Alternate Mobile
            { wch: 40 },  // LinkedIn URL
            { wch: 15 },  // Role
            { wch: 15 },  // Award Winner
            { wch: 20 },  // Check In
        ];
        ws['!cols'] = wscols;

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'All Attendees');

        // Generate Excel file
        const fileName = `all_attendees_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        // Show success message
        toast('Export successful!', {
            className: "!bg-green-800 !text-white !font-sans !font-regular tracking-wider flex items-center gap-2",
            icon: <CircleCheck className='size-5' />
        });
    };

    if (loading) return <Wave />

    return (
        <div>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2.5'>
                    <GoBack />
                    <h1 className='text-xl font-semibold'>All Attendees</h1>
                </div>

                <div className='flex items-center gap-5'>
                    <Button
                        className='btn !rounded-[10px] !px-3'
                        onClick={handleExportToExcel}
                    >
                        Export Data
                    </Button>
                </div>
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

                    <span className='font-semibold text-sm'>Total Attendees: {allEventsAttendees.length}</span>
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
                </div>

                <Table className='mt-4'>
                    <TableHeader className='bg-brand-light-gray !rounded-[10px]'>
                        <TableRow className='!text-base'>
                            <TableHead className="text-left min-w-10 !px-2">Sr.No</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Name</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Designation</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Company</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Email</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">A. Email</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Mobile</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">A. Mobile</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">LinkedIn URL</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Role</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Award Winner</TableHead>
                            <TableHead className="text-left min-w-10 !px-2">Checked In</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedAttendees.map((attendee: AttendeeType, index: number) => (
                            <TableRow key={attendee.id}>
                                <TableCell className="text-left min-w-10 font-medium">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                                <TableCell className="text-left min-w-10 !capitalize">
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
                                <TableCell className="text-left min-w-10">
                                    {attendee.linkedin_page_link || "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.status || "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.award_winner !== null && attendee.award_winner !== undefined
                                        ? (attendee.award_winner === 1 ? "Yes" : "No")
                                        : "-"}
                                </TableCell>
                                <TableCell className="text-left min-w-10">
                                    {attendee.check_in === 1 ? (attendee.check_in_time ? formatDateTime(attendee.check_in_time) : "Yes") : "No"}
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

export default AllAttendees;